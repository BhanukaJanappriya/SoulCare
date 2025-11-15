# soulcare_backend/chat/consumers.py
# (This is a NEW FILE)
import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Conversation, Message
from .serializers import MessageSerializer
from authapp.models import User

class ChatConsumer(AsyncJsonWebsocketConsumer):
    
    async def connect(self):
        """
        Called when a user tries to connect to the WebSocket.
        """
        # Get the conversation ID from the URL
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        # Get the user from our auth middleware
        self.user = self.scope['user']

        # Check if the user is authenticated
        if self.user.is_anonymous:
            await self.close()
            return

        # Check if the user belongs to this conversation
        is_member = await self.is_user_member_of_conversation(self.user, self.conversation_id)
        
        if not is_member:
            # Reject the connection if the user is not part of the chat
            await self.close()
            return

        # If authorized, accept the connection
        await self.accept()

        # Create a unique "group" name for this conversation
        self.conversation_group_name = f"chat_{self.conversation_id}"

        # Add this user's channel to the conversation's group
        await self.channel_layer.group_add(
            self.conversation_group_name,
            self.channel_name # This is the user's unique WebSocket ID
        )

    async def disconnect(self, close_code):
        """
        Called when the WebSocket connection is closed.
        """
        # Remove this user's channel from the conversation's group
        if hasattr(self, 'conversation_group_name'):
            await self.channel_layer.group_discard(
                self.conversation_group_name,
                self.channel_name
            )

    async def receive_json(self, content):
        """
        Called when we receive a message from the client (as JSON).
        """
        message_content = content.get('message','type')
        
        if message_content == 'chat_message':
            message_content = content.get('message')
            if not message_content or not self.user.is_authenticated:
                return

        # --- FIX: Create AND Serialize in async-safe blocks ---

        # 1. Create the message in the database
        new_message = await self.create_new_message(
            conversation_id=self.conversation_id,
            sender=self.user,
            content=message_content
        )

        if new_message is None:
            print(f"Error: Could not create message for convo {self.conversation_id}")
            return
            
        # 2. Serialize the message in a separate async-safe block
        # This is necessary because MessageSerializer calls UserInfoSerializer,
        # which accesses the database for profile info.
        message_data = await self.serialize_message(new_message)

        if message_data is None:
            print(f"Error: Could not serialize message {new_message.id}")
            return
        
        # --- END FIX ---

        # Broadcast the new (and correctly serialized) message
        await self.channel_layer.group_send(
            self.conversation_group_name,
            {
                'type': 'chat.message', # This calls the 'chat_message' method
                'message': message_data # Pass the already-serialized data
            }
        )

    async def chat_message(self, event):
        """
        Handler for the 'chat.message' type event.
        It sends the message broadcast from group_send down to the client.
        """
        message = event['message']
        
        # Send the message (as a JSON string) to the client
        await self.send_json(content=message)
        
        
    async def chat_delete_message(self, event):
        """
        Handler for the 'chat.delete_message' type event.
        Receives this event from the MessageDetailView.
        """
        message_id = event['message_id']
        
        # Broadcast the ID of the deleted message to the client
        await self.send_json(content={
            'type': 'delete_message', # Send a custom type to the frontend
            'message_id': message_id
        })
        
    

    # --- Database Helper Methods ---

    @database_sync_to_async
    def is_user_member_of_conversation(self, user, conversation_id):
        """
        Checks if a user is either the patient or provider for a conversation.
        """
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            return conversation.patient == user or conversation.provider == user
        except Conversation.DoesNotExist:
            return False

    @database_sync_to_async
    def create_new_message(self, conversation_id, sender, content):
        """
        Saves a new message to the database.
        """
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            # Mark all messages as read by the sender
            conversation.messages.filter(is_read=False).exclude(sender=sender).update(is_read=True)
            
            # Create the new message
            message = Message.objects.create(
                conversation=conversation,
                sender=sender,
                content=content
            )
            return message
        except Conversation.DoesNotExist:
            print(f"Error: Conversation {conversation_id} does not exist.")
            return None
          
  
    @database_sync_to_async
    def serialize_message(self, message):
        """
        Runs the serializer in a sync-safe block.
        """
        try:
            return MessageSerializer(message).data
        except Exception as e:
            print(f"Error serializing message: {e}")
            return None
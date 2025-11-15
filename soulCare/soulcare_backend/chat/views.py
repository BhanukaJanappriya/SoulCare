# soulcare_backend/chat/views.py
# (This is a NEW FILE)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, status
from django.db.models import Q
from authapp.models import User
from appointments.models import Appointment
from .models import Conversation, Message
from .serializers import ConversationListSerializer, MessageSerializer
from .permissions import IsSender

class ContactListView(APIView):
    """
    API endpoint to get a user's chat "contact list".
    
    - For Patients: Returns all Providers they've had an appointment with.
    - For Providers: Returns all Patients they've had an appointment with.
    
    This view finds or creates a Conversation for each contact.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        conversations = Conversation.objects.none()

        if user.role == 'user':
            # 1. Patient: Find all providers they have appointments with
            provider_ids = Appointment.objects.filter(patient=user).values_list('provider_id', flat=True).distinct()
            contacts = User.objects.filter(id__in=provider_ids)
            
            # 2. Find or create conversations for each provider
            for provider in contacts:
                Conversation.objects.get_or_create(patient=user, provider=provider)
            
            # 3. Get all conversations for this patient
            conversations = Conversation.objects.filter(patient=user)\
                                                .select_related('provider', 'patient')\
                                                .prefetch_related('messages')

        elif user.role in ['doctor', 'counselor']:
            # 1. Provider: Find all patients they have appointments with
            patient_ids = Appointment.objects.filter(provider=user).values_list('patient_id', flat=True).distinct()
            contacts = User.objects.filter(id__in=patient_ids)
            
            # 2. Find or create conversations for each patient
            for patient in contacts:
                Conversation.objects.get_or_create(patient=patient, provider=user)
                
            # 3. Get all conversations for this provider
            conversations = Conversation.objects.filter(provider=user)\
                                                .select_related('provider', 'patient')\
                                                .prefetch_related('messages')
            
        else:
            return Response([], status=200) # Admins or other roles have no contacts

        # Pass the requesting user to the serializer's context
        # This is CRITICAL for the serializer to calculate 'other_user' and 'unread_count'
        serializer_context = {'user': request.user}
        serializer = ConversationListSerializer(conversations, many=True, context=serializer_context)

        return Response(serializer.data)


class MessageListView(APIView):
    """
    API endpoint to get all messages for a specific conversation
    and mark them as read.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, conversation_id, *args, **kwargs):
        try:
            # Get the conversation
            conversation = Conversation.objects.get(id=conversation_id)
            
            # Security check: ensure the user is part of this conversation
            if request.user != conversation.patient and request.user != conversation.provider:
                return Response({"detail": "Not authorized to view this conversation."}, status=403)
                
            # Mark all messages sent by OTHERS as read
            conversation.messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)
            
            # Get all messages for the conversation, ordered by time
            messages = conversation.messages.order_by('timestamp').select_related('sender')
            serializer = MessageSerializer(messages, many=True)
            return Response(serializer.data)
            
        except Conversation.DoesNotExist:
            return Response({"detail": "Conversation not found."}, status=404)
        


class MessageDetailView(generics.RetrieveDestroyAPIView):
    """
    API endpoint for retrieving or deleting a single message.
    DELETE /api/chat/messages/<id>/
    """
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated, IsSender] # Only the sender can delete
    lookup_field = 'pk' # Use the message ID from the URL

    def destroy(self, request, *args, **kwargs):
        message = self.get_object()
        conversation_id = message.conversation.id
        message_id = message.id
        
        # Delete the message from the database
        self.perform_destroy(message)
        
        # --- Real-time Broadcast ---
        # After deleting, we need to tell the WebSocket consumer to broadcast this deletion
        try:
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync

            channel_layer = get_channel_layer()
            group_name = f"chat_{conversation_id}"

            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    "type": "chat.delete_message", # This calls the 'chat_delete_message' handler in your consumer
                    "message_id": message_id,
                },
            )
        except Exception as e:
            # Log this error, as it means the real-time delete failed
            print(f"Error broadcasting message deletion: {e}")
        
        return Response(status=status.HTTP_204_NO_CONTENT)
# soulcare_backend/chat/serializers.py
# (This is a NEW FILE)

from rest_framework import serializers
from .models import Conversation, Message
from authapp.serializers import UserInfoSerializer # Import your existing user serializer
from authapp.models import User

class MessageSerializer(serializers.ModelSerializer):
    """
    Serializer for the Message model
    """
    sender = UserInfoSerializer(read_only=True) # Show nested sender info
    
    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'content', 'timestamp', 'is_read']
        read_only_fields = ['id', 'conversation', 'sender', 'timestamp']


class ConversationListSerializer(serializers.ModelSerializer):
    """
    Serializer for the Conversation list.
    This shows the *other* person in the chat, not the user requesting the list.
    """
    other_user = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        # We don't need patient/provider here, just the 'other_user'
        fields = ['id', 'other_user', 'last_message', 'unread_count']

    def get_other_user(self, obj):
        """
        Get the user who is *not* the one requesting the list.
        """
        user = self.context.get('user')
        if obj.patient == user:
            # Use the UserInfoSerializer to show provider details
            return UserInfoSerializer(obj.provider, context=self.context).data
        else:
            # Use the UserInfoSerializer to show patient details
            return UserInfoSerializer(obj.patient, context=self.context).data

    def get_last_message(self, obj):
        # Get the most recent message from the conversation
        last_msg = obj.messages.order_by('-timestamp').first()
        if last_msg:
            # We serialize the message using MessageSerializer
            return MessageSerializer(last_msg, context=self.context).data
        return None

    def get_unread_count(self, obj):
        # Get the count of unread messages *for the current user*
        user = self.context.get('user')
        if user:
            # Count messages where the user is NOT the sender and is_read is False
            return obj.messages.filter(is_read=False).exclude(sender=user).count()
        return 0
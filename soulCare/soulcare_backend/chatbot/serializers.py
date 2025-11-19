# soulcare_backend/chatbot/serializers.py

from rest_framework import serializers

class UserInputSerializer(serializers.Serializer):
    """Serializer for the message sent by the user."""
    message = serializers.CharField(max_length=5000)

class BotResponseSerializer(serializers.Serializer):
    """Serializer for the response sent back to the frontend."""
    message = serializers.CharField()

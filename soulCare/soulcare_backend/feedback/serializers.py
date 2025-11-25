from rest_framework import serializers
from .models import Feedback
from authapp.serializers import UserInfoSerializer # Reuse existing user info serializer

class FeedbackSerializer(serializers.ModelSerializer):
    user = UserInfoSerializer(read_only=True)

    class Meta:
        model = Feedback
        fields = ['id', 'user', 'content', 'rating', 'is_approved', 'created_at']
        read_only_fields = ['id', 'user', 'is_approved', 'created_at']

class FeedbackCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ['content', 'rating']
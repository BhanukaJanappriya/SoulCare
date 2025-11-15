# soulcare_backend/habits/serializers.py

from rest_framework import serializers
from .models import Habit

class HabitSerializer(serializers.ModelSerializer):
    # Custom field to match frontend 'completedToday'
    completedToday = serializers.BooleanField(source='completed_today', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    lastCompleted = serializers.DateField(source='last_completed', required=False, allow_null=True)

    # Fields that need to match the frontend naming convention
    # current, target, streak, name, description, frequency, category, color are fine as they are.

    class Meta:
        model = Habit
        fields = [
            'id',
            'name',
            'description',
            'frequency',
            'target',
            'current',
            'streak',
            'category',
            'color',
            'completedToday',  # Mapped from completed_today
            'createdAt',       # Mapped from created_at
            'lastCompleted',   # Mapped from last_completed
        ]
        read_only_fields = ['user', 'current', 'streak', 'completed_today', 'last_completed', 'created_at']


class HabitToggleSerializer(serializers.Serializer):
    """
    Serializer for the action to mark a habit as completed/uncompleted.
    The view logic will handle the streak/current updates.
    """
    completed = serializers.BooleanField(required=True)

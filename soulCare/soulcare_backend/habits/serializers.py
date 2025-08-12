# from rest_framework import serializers
# from .models import Habit

# class HabitSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Habit
#         fields = [
#             'id', 'name', 'description', 'frequency', 'target',
#             'current', 'streak', 'best_streak', 'category', 'color',
#             'completed_today', 'last_completed_date', 'created_at'
#         ]
#         read_only_fields = ['id', 'user', 'current', 'streak', 'best_streak', 'completed_today', 'last_completed_date', 'created_at']
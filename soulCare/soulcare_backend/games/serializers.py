from rest_framework import serializers
from .models import ReactionTimeResult, MemoryGameResult, StroopGameResult


class ReactionTimeResultSerializer(serializers.ModelSerializer):
    perceived_effort = serializers.IntegerField(required=False)
    stress_reduction_rating = serializers.IntegerField(required=False)
    class Meta:
        model = ReactionTimeResult
        fields = [
            'id',
            'reaction_time_ms',
            'post_game_mood',
            'perceived_effort',
            'stress_reduction_rating',
            'user',
            'created_at'
        ]
        read_only_fields = ['user', 'created_at']


# Memory Game
class MemoryGameResultSerializer(serializers.ModelSerializer):
    # Explicitly define fields to complement null=True in model
    perceived_effort = serializers.IntegerField(required=False)
    stress_reduction_rating = serializers.IntegerField(required=False)

    class Meta:
        model = MemoryGameResult
        fields = [
            'id',
            'max_sequence_length',
            'total_attempts',
            'post_game_mood',
            'perceived_effort',
            'stress_reduction_rating',
            'user',
            'created_at'
        ]
        read_only_fields = ['user', 'created_at']

# StroopGame
class StroopGameResultSerializer(serializers.ModelSerializer):
    # Explicitly define fields to complement null=True in model
    perceived_effort = serializers.IntegerField(required=False)
    stress_reduction_rating = serializers.IntegerField(required=False)

    class Meta:
        model = StroopGameResult
        fields = [
            'id',
            'total_correct',
            'interference_score_ms',
            'total_time_s',
            'post_game_mood',
            'perceived_effort',
            'stress_reduction_rating',
            'user',
            'created_at'
        ]
        read_only_fields = ['user', 'created_at']

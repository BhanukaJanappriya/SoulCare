from rest_framework import serializers
from .models import ReactionTimeResult, MemoryGameResult, StroopGameResult,LongestNumberGameResult,NumpuzGameResult


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

# Longest Number Sequence game
class LongestNumberGameResultSerializer(serializers.ModelSerializer):
    # Explicitly define fields to complement null=True in model
    perceived_effort = serializers.IntegerField(required=False)
    stress_reduction_rating = serializers.IntegerField(required=False)

    post_game_mood = serializers.IntegerField(required=False)

    # ADDED: Make total_reaction_time_ms required=False to align with default=0 in model
    total_reaction_time_ms = serializers.IntegerField(required=False)

    user = serializers.PrimaryKeyRelatedField(read_only=True)




    class Meta:
        model = LongestNumberGameResult
        fields = [
            'id',
            'max_number_length',
            'total_attempts',
            'total_reaction_time_ms',
            'post_game_mood',
            'perceived_effort',
            'stress_reduction_rating',
            'user',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class NumpuzGameResultSerializer(serializers.ModelSerializer):
    perceived_effort = serializers.IntegerField(required=False)
    stress_reduction_rating = serializers.IntegerField(required=False)
    post_game_mood = serializers.IntegerField(required=False)

    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = NumpuzGameResult
        fields = [
            'id',
            'time_taken_s',
            'puzzle_size',
            'moves_made',
            'post_game_mood',
            'perceived_effort',
            'stress_reduction_rating',
            'user',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']

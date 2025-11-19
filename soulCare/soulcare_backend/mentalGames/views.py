from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes # New Imports
from rest_framework.response import Response
from django.http import HttpResponse # New Import for CSV response
import csv # New Import
import io
from .models import ReactionTimeResult, MemoryGameResult, StroopGameResult
from .serializers import ReactionTimeResultSerializer, MemoryGameResultSerializer, StroopGameResultSerializer
from authapp.permissions import IsAdminOrCounselor
class ReactionTimeResultListCreateView(generics.ListCreateAPIView):
    # Only authenticated users can access this endpoint
    permission_classes = [IsAuthenticated]

    serializer_class = ReactionTimeResultSerializer

    # For GET requests: show only the current user's results
    def get_queryset(self):
        return ReactionTimeResult.objects.filter(user=self.request.user)

    # For POST requests: automatically attach the logged-in user
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class MemoryGameResultListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MemoryGameResultSerializer

    def get_queryset(self):
        # Only show the results for the current user
        return MemoryGameResult.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically set the 'user' field to the logged-in user before saving
        serializer.save(user=self.request.user)


class StroopGameResultListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = StroopGameResultSerializer

    def get_queryset(self):
        # Only show the results for the current user
        return StroopGameResult.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically set the 'user' field to the logged-in user before saving
        serializer.save(user=self.request.user)


# --- New Admin Export View (Function-Based) ---

@api_view(['GET'])
@permission_classes([IsAdminOrCounselor]) # Enforce Admin/Counselor only
def export_all_game_data_csv(request):
    """
    Exports all game results (Reaction Time, Memory, Stroop) as a single CSV.
    """
    # 1. Setup CSV Response
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="soulcare_game_matrix.csv"'
    writer = csv.writer(response)

    # 2. Define universal header fields for the matrix
    # The header includes common fields and game-specific fields
    header = [
        'user_id', 'username', 'game_type', 'created_at',
        # Universal Matrix Fields
        'post_game_mood', 'perceived_effort', 'stress_reduction_rating',
        # Core Score Fields (Game-Specific)
        'rt_ms', 'max_sequence_length', 'total_correct', 'interference_score_ms',
    ]
    writer.writerow(header)

    # 3. Fetch and Write Data
    all_models_data = []

    # Reaction Time Data
    for result in ReactionTimeResult.objects.all().select_related('user'):
        all_models_data.append({
            'user_id': result.user.id,
            'username': result.user.username,
            'game_type': 'reaction_time',
            'created_at': result.created_at.isoformat(),
            'post_game_mood': result.post_game_mood,
            'perceived_effort': result.perceived_effort,
            'stress_reduction_rating': result.stress_reduction_rating,
            'rt_ms': result.reaction_time_ms,
            'max_sequence_length': '',
            'total_correct': '',
            'interference_score_ms': '',
        })

    # Memory Game Data
    for result in MemoryGameResult.objects.all().select_related('user'):
        all_models_data.append({
            'user_id': result.user.id,
            'username': result.user.username,
            'game_type': 'memory_game',
            'created_at': result.created_at.isoformat(),
            'post_game_mood': result.post_game_mood,
            'perceived_effort': result.perceived_effort,
            'stress_reduction_rating': result.stress_reduction_rating,
            'rt_ms': '',
            'max_sequence_length': result.max_sequence_length,
            'total_correct': '',
            'interference_score_ms': '',
        })

    # Stroop Game Data
    for result in StroopGameResult.objects.all().select_related('user'):
        all_models_data.append({
            'user_id': result.user.id,
            'username': result.user.username,
            'game_type': 'stroop_test',
            'created_at': result.created_at.isoformat(),
            'post_game_mood': result.post_game_mood,
            'perceived_effort': result.perceived_effort,
            'stress_reduction_rating': result.stress_reduction_rating,
            'rt_ms': '',
            'max_sequence_length': '',
            'total_correct': result.total_correct,
            'interference_score_ms': result.interference_score_ms,
        })

    # Write all data rows
    for row_data in all_models_data:
        row = [row_data.get(field, '') for field in header] # Get data, use empty string if missing
        writer.writerow(row)

    return response

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes # New Imports
from rest_framework.response import Response
from django.http import HttpResponse # New Import for CSV response
import csv # New Import
import io
from django.db.models import Max, Avg, Count, Sum, Min
from .models import ReactionTimeResult, MemoryGameResult, StroopGameResult,AdditionsGameResult,LongestNumberGameResult,NumpuzGameResult
from .serializers import ReactionTimeResultSerializer, MemoryGameResultSerializer, StroopGameResultSerializer,LongestNumberGameResultSerializer,NumpuzGameResultSerializer,AdditionsGameResultSerializer
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

class LongestNumberGameResultListCreateView(generics.ListCreateAPIView):
    # Only authenticated users can access this endpoint
    permission_classes = [IsAuthenticated]
    serializer_class = LongestNumberGameResultSerializer

    # For GET requests: show only the current user's results
    def get_queryset(self):
        return LongestNumberGameResult.objects.filter(user=self.request.user)

    # For POST requests: automatically attach the logged-in user
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def longest_number_stats_view(request):
    """
    Fetches the current user's highest score, average score, total plays, and a brief history
    for the Longest Number Game.
    """
    user_results = LongestNumberGameResult.objects.filter(user=request.user)

    # 1. Calculate Aggregate Stats
    aggregates = user_results.aggregate(
        max_score=Max('max_number_length'),
        avg_score=Avg('max_number_length'),
        total_plays=Count('id'),
        total_time_ms=Sum('total_reaction_time_ms') # <--- ADDED
    )

    # 2. Get Recent History (e.g., last 15 results, or all if we can)
    history_data = user_results.order_by('-created_at').values('max_number_length', 'total_reaction_time_ms', 'created_at')

    # Format the history data for the frontend
    formatted_history = [
        {
            'score': item['max_number_length'],
            'time': round(item['total_reaction_time_ms'] / 1000, 2), # Convert ms to s
            'created_at': item['created_at'].isoformat()
        }
        for item in history_data
    ]

    stats = {
        'highest_score': aggregates['max_score'] if aggregates['max_score'] is not None else 0,
        'average_score': round(aggregates['avg_score'], 1) if aggregates['avg_score'] is not None else 0,
        'total_plays': aggregates['total_plays'],
        'total_time_ms': aggregates['total_time_ms'] if aggregates['total_time_ms'] is not None else 0, # NEW
        'history': formatted_history,
    }

    return Response(stats)

class NumpuzGameResultListCreateView(generics.ListCreateAPIView):
    # Only authenticated users can access this endpoint
    permission_classes = [IsAuthenticated]
    serializer_class = NumpuzGameResultSerializer

    # For GET requests: show only the current user's results
    def get_queryset(self):
        return NumpuzGameResult.objects.filter(user=self.request.user)

    # For POST requests: automatically attach the logged-in user
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def numpuz_stats_view(request):
    """
    Fetches the current user's best time, minimum moves, and total plays
    for the Numpuz Game.
    """
    user_results = NumpuzGameResult.objects.filter(user=request.user)

    # 1. Calculate Aggregate Stats
    aggregates = user_results.aggregate(
        best_time=Min('time_taken_s'), # Min time is the best score
        min_moves=Min('moves_made'), # Min moves is also a key metric
        total_plays=Count('id')
    )

    # 2. Get Recent History (e.g., last 10 results, sorted by best time)
    history_data = user_results.order_by('time_taken_s')[:10].values('time_taken_s', 'moves_made', 'puzzle_size', 'created_at')

    # Format the history data for the frontend
    formatted_history = [
        {
            'score': item['moves_made'], # Using moves_made as the history 'score' for general use
            'time_taken_s': item['time_taken_s'],
            'puzzle_size': item['puzzle_size'],
            'created_at': item['created_at'].isoformat()
        }
        for item in history_data
    ]

    stats = {
        'best_time_s': round(aggregates['best_time'] or 0, 2),
        'min_moves': aggregates['min_moves'] or 0,
        'total_plays': aggregates['total_plays'],
        'history': formatted_history,
    }

    return Response(stats)

class AdditionsGameResultListCreateView(generics.ListCreateAPIView):
    # Only authenticated users can access this endpoint
    permission_classes = [IsAuthenticated]
    serializer_class = AdditionsGameResultSerializer

    # For GET requests: show only the current user's results
    def get_queryset(self):
        return AdditionsGameResult.objects.filter(user=self.request.user)

    # For POST requests: automatically attach the logged-in user
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def additions_stats_view(request):
    """
    Fetches the current user's highest correct score, average correct score, and total plays
    for the Additions Game.
    """
    user_results = AdditionsGameResult.objects.filter(user=request.user)

    # 1. Calculate Aggregate Stats
    aggregates = user_results.aggregate(
        highest_correct=Max('total_correct'),
        avg_correct=Avg('total_correct'),
        total_plays=Count('id')
    )

    # 2. Get Recent History (e.g., last 10 results, sorted by highest correct DESC)
    history_data = user_results.order_by('-total_correct', 'time_taken_s')[:10].values('total_correct', 'time_taken_s', 'difficulty_level', 'created_at')

    # Format the history data for the frontend
    formatted_history = [
        {
            'score': item['total_correct'],
            'time': item['time_taken_s'],
            'difficulty': item['difficulty_level'],
            'created_at': item['created_at'].isoformat()
        }
        for item in history_data
    ]

    stats = {
        'highest_correct': aggregates['highest_correct'] or 0,
        'avg_correct': round(aggregates['avg_correct'] or 0, 1),
        'total_plays': aggregates['total_plays'],
        'history': formatted_history,
    }

    return Response(stats)

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


from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from rest_framework import status


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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats_view(request):
    """
    Fetches aggregate statistics for the patient's games dashboard.
    This view performs all necessary aggregations across all game models.
    """
    user = request.user

    # 1. Initialize result structure matching the GameDashboardStats interface
    stats_data = {
        'total_games_played': 0,
        'average_success_rate': 0.0,
        'total_time_spent_h': 0.0,
        'summary': {
            'reaction_time': {'best_time_ms': None, 'total_plays': 0},
            'memory_game': {'max_sequence_length': None, 'total_plays': 0},
            'stroop_game': {'best_correct_percentage': None, 'avg_interference_ms': None, 'total_plays': 0},
            'longest_number': {'max_number_length': None, 'total_plays': 0},
            'numpuz_game': {'best_time_s': None, 'min_moves': None, 'total_plays': 0},
            'additions_game': {'highest_correct': None, 'total_plays': 0},
            # Placeholder for unmodeled games (total_plays will remain 0)
            'emotion_recognition': {'total_plays': 0, 'best_metric': None, 'last_played_at': None},
            'visual_attention_tracker': {'total_plays': 0, 'best_metric': None, 'last_played_at': None},
            'pattern_recognition': {'total_plays': 0, 'best_metric': None, 'last_played_at': None},
            'mood_reflection_game': {'total_plays': 0, 'best_metric': None, 'last_played_at': None},
        }
    }

    total_time_ms_sum = 0
    total_games_played = 0

    # List to store individual game scores (as percentages or equivalent) for overall average calculation
    average_scores = []

    # --- 2. Reaction Time Stats ---
    rt_results = ReactionTimeResult.objects.filter(user=user)
    rt_agg = rt_results.aggregate(
        best_time=Min('reaction_time_ms'),
        count=Count('id'),
        time_sum=Sum('reaction_time_ms')
    )
    if rt_agg['count'] > 0:
        best_time = rt_agg['best_time']
        stats_data['summary']['reaction_time']['best_time_ms'] = best_time
        stats_data['summary']['reaction_time']['total_plays'] = rt_agg['count']
        total_games_played += rt_agg['count']
        total_time_ms_sum += rt_agg['time_sum'] if rt_agg['time_sum'] else 0

        # Reaction Time: Lower is better. A simple score conversion (higher is better) for overall average is difficult.
        # Let's use a normalized score (e.g., 100 - min_ms / 10). For now, we omit it from overall average.

    # --- 3. Memory Game Stats ---
    mem_results = MemoryGameResult.objects.filter(user=user)
    mem_agg = mem_results.aggregate(
        max_length=Max('max_sequence_length'),
        count=Count('id')
    )
    if mem_agg['count'] > 0:
        max_length = mem_agg['max_length']
        stats_data['summary']['memory_game']['max_sequence_length'] = max_length
        stats_data['summary']['memory_game']['total_plays'] = mem_agg['count']
        total_games_played += mem_agg['count']
        # Assuming a max possible score of 10 levels, we can normalize for avg success rate
        # Let's say max possible length is 10.
        if max_length is not None:
             average_scores.append(min(100, (max_length / 10) * 100))


    # --- 4. Stroop Game Stats ---
    stroop_results = StroopGameResult.objects.filter(user=user)
    stroop_agg = stroop_results.aggregate(
        best_total_correct=Max('total_correct'),
        avg_interference=Avg('interference_score_ms'),
        count=Count('id'),
        total_time_s_sum=Sum('total_time_s')
    )
    if stroop_agg['count'] > 0:
        total_plays = stroop_agg['count']
        best_correct = stroop_agg['best_total_correct']
        avg_interference = stroop_agg['avg_interference']
        total_games_played += total_plays
        total_time_ms_sum += int((stroop_agg['total_time_s_sum'] or 0) * 1000)

        # Assuming 20 trials total in Stroop game (example max)
        max_trials = 20
        best_correct_percentage = (best_correct / max_trials) * 100 if best_correct is not None else None

        stats_data['summary']['stroop_game']['best_correct_percentage'] = best_correct_percentage
        stats_data['summary']['stroop_game']['avg_interference_ms'] = round(avg_interference, 2) if avg_interference is not None else None
        stats_data['summary']['stroop_game']['total_plays'] = total_plays

        if best_correct_percentage is not None:
            average_scores.append(best_correct_percentage)


    # --- 5. Longest Number Stats ---
    ln_results = LongestNumberGameResult.objects.filter(user=user)
    ln_agg = ln_results.aggregate(
        max_length=Max('max_number_length'),
        count=Count('id'),
        time_sum=Sum('total_reaction_time_ms')
    )
    if ln_agg['count'] > 0:
        max_length = ln_agg['max_length']
        stats_data['summary']['longest_number']['max_number_length'] = max_length
        stats_data['summary']['longest_number']['total_plays'] = ln_agg['count']
        total_games_played += ln_agg['count']
        total_time_ms_sum += ln_agg['time_sum'] if ln_agg['time_sum'] else 0

        # Assuming max possible length is 12 (example)
        if max_length is not None:
            average_scores.append(min(100, (max_length / 12) * 100))


    # --- 6. Numpuz Game Stats ---
    npz_results = NumpuzGameResult.objects.filter(user=user)
    npz_agg = npz_results.aggregate(
        best_time=Min('time_taken_s'),
        min_moves=Min('moves_made'),
        count=Count('id'),
        time_sum=Sum('time_taken_s')
    )
    if npz_agg['count'] > 0:
        stats_data['summary']['numpuz_game']['best_time_s'] = round(npz_agg['best_time'], 2) if npz_agg['best_time'] is not None else None
        stats_data['summary']['numpuz_game']['min_moves'] = npz_agg['min_moves']
        stats_data['summary']['numpuz_game']['total_plays'] = npz_agg['count']
        total_games_played += npz_agg['count']
        total_time_ms_sum += int((npz_agg['time_sum'] or 0) * 1000)

        # Numpuz: Best score is low time/moves. Omit from simple average success rate.


    # --- 7. Additions Game Stats ---
    add_results = AdditionsGameResult.objects.filter(user=user)
    add_agg = add_results.aggregate(
        highest_correct=Max('total_correct'),
        avg_correct=Avg('total_correct'),
        count=Count('id'),
        time_sum=Sum('time_taken_s')
    )
    if add_agg['count'] > 0:
        highest_correct = add_agg['highest_correct']
        stats_data['summary']['additions_game']['highest_correct'] = highest_correct
        stats_data['summary']['additions_game']['total_plays'] = add_agg['count']
        total_games_played += add_agg['count']
        total_time_ms_sum += int((add_agg['time_sum'] or 0) * 1000)

        # Assuming max possible correct is 100 (example)
        if highest_correct is not None:
             average_scores.append(min(100, (highest_correct / 100) * 100)) # Simple percentage

    # --- 8. Final Aggregate Calculations for Main Stat Cards ---

    # Total Games Played
    stats_data['total_games_played'] = total_games_played

    # Average Success Rate (using games where a score-to-percentage conversion is possible)
    if average_scores:
        stats_data['average_success_rate'] = round(sum(average_scores) / len(average_scores), 1)

    # Total Time Spent (convert total_time_ms_sum to hours)
    stats_data['total_time_spent_h'] = round((total_time_ms_sum / 1000) / 3600, 1)

    return Response(stats_data)




class AdminGameDataExportView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, *args, **kwargs):
        game_type = request.query_params.get('game_type')
        
        if not game_type:
            return Response({"error": "Game type is required."}, status=status.HTTP_400_BAD_REQUEST)

        response = HttpResponse(content_type='text/csv')
        filename = f"{game_type}_data.csv"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'

        writer = csv.writer(response)

        if game_type == 'reaction-time':
            writer.writerow(['User', 'Date', 'Reaction Time (ms)', 'Mood', 'Effort', 'Calmness'])
            results = ReactionTimeResult.objects.select_related('user').all().order_by('-created_at')
            for r in results:
                writer.writerow([
                    r.user.username, 
                    r.created_at.strftime("%Y-%m-%d %H:%M"), 
                    r.reaction_time_ms, 
                    r.get_post_game_mood_display(), 
                    r.perceived_effort, 
                    r.stress_reduction_rating
                ])

        elif game_type == 'memory-game':
            writer.writerow(['User', 'Date', 'Max Sequence', 'Attempts', 'Mood', 'Effort', 'Calmness'])
            results = MemoryGameResult.objects.select_related('user').all().order_by('-created_at')
            for r in results:
                writer.writerow([
                    r.user.username, 
                    r.created_at.strftime("%Y-%m-%d %H:%M"), 
                    r.max_sequence_length, 
                    r.total_attempts,
                    r.get_post_game_mood_display(), 
                    r.perceived_effort, 
                    r.stress_reduction_rating
                ])

        elif game_type == 'stroop-game':
            writer.writerow(['User', 'Date', 'Correct', 'Interference (ms)', 'Time (s)', 'Mood', 'Effort', 'Calmness'])
            results = StroopGameResult.objects.select_related('user').all().order_by('-created_at')
            for r in results:
                writer.writerow([
                    r.user.username, 
                    r.created_at.strftime("%Y-%m-%d %H:%M"), 
                    r.total_correct, 
                    r.interference_score_ms,
                    r.total_time_s,
                    r.get_post_game_mood_display(), 
                    r.perceived_effort, 
                    r.stress_reduction_rating
                ])
        
        elif game_type == 'longest-number':
            writer.writerow(['User', 'Date', 'Max Digits', 'Reaction Time (ms)', 'Attempts', 'Mood', 'Effort', 'Calmness'])
            results = LongestNumberGameResult.objects.select_related('user').all().order_by('-created_at')
            for r in results:
                writer.writerow([
                    r.user.username, 
                    r.created_at.strftime("%Y-%m-%d %H:%M"), 
                    r.max_number_length,
                    r.total_reaction_time_ms,
                    r.total_attempts,
                    r.get_post_game_mood_display(), 
                    r.perceived_effort, 
                    r.stress_reduction_rating
                ])

        elif game_type == 'numpuz-game':
            writer.writerow(['User', 'Date', 'Time (s)', 'Size', 'Moves', 'Mood', 'Effort', 'Calmness'])
            results = NumpuzGameResult.objects.select_related('user').all().order_by('-created_at')
            for r in results:
                writer.writerow([
                    r.user.username, 
                    r.created_at.strftime("%Y-%m-%d %H:%M"), 
                    r.time_taken_s,
                    r.puzzle_size,
                    r.moves_made,
                    r.get_post_game_mood_display(), 
                    r.perceived_effort, 
                    r.stress_reduction_rating
                ])

        elif game_type == 'additions-game':
            writer.writerow(['User', 'Date', 'Correct', 'Time (s)', 'Difficulty', 'Mood', 'Effort', 'Calmness'])
            results = AdditionsGameResult.objects.select_related('user').all().order_by('-created_at')
            for r in results:
                writer.writerow([
                    r.user.username, 
                    r.created_at.strftime("%Y-%m-%d %H:%M"), 
                    r.total_correct,
                    r.time_taken_s,
                    r.difficulty_level,
                    r.get_post_game_mood_display(), 
                    r.perceived_effort, 
                    r.stress_reduction_rating
                ])

        else:
            return Response({"error": "Invalid game type."}, status=status.HTTP_400_BAD_REQUEST)

        return response
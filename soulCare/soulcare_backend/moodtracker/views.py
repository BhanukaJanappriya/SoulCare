from rest_framework import viewsets, permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import date, timedelta
from django.db.models.functions import TruncDay
from django.db.models import Avg, F, Value
from .models import MoodEntry, Activity, Tag
from .serializers import MoodEntrySerializer, ActivitySerializer, TagSerializer

class MoodEntryViewSet(viewsets.ModelViewSet):
    serializer_class = MoodEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MoodEntry.objects.filter(patient=self.request.user)

    def perform_create(self, serializer):
        serializer.save(patient=self.request.user)

class ActivityListView(generics.ListAPIView):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    permission_classes = [permissions.IsAuthenticated]

# NEW: A read-only endpoint to list all available tags
class TagListView(generics.ListAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]

class WeeklyMoodStatsView(APIView):
    """
    Returns the average mood, energy, and anxiety for the last 7 days.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        today = date.today()
        seven_days_ago = today - timedelta(days=6)

        # Get entries for the last 7 days
        queryset = MoodEntry.objects.filter(
            patient=request.user,
            date__range=[seven_days_ago, today]
        )

        # Annotate and Aggregate: Average mood, energy, and anxiety per day
        daily_stats = queryset.annotate(
            day=TruncDay('date')
        ).values('day').annotate(
            mood=Avg('mood'),
            energy=Avg('energy'),
            anxiety=Avg('anxiety')
        ).order_by('day')

        # Format the output to match the frontend WeeklyMoodDataPoint interface
        days_of_week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

        # Build a dictionary for easy lookup
        stats_map = {
            item['day'].strftime('%a'): {
                'day': item['day'].strftime('%a'),
                'mood': round(item['mood'], 1) if item['mood'] else 0,
                'energy': round(item['energy'], 1) if item['energy'] else 0,
                'anxiety': round(item['anxiety'], 1) if item['anxiety'] else 0,
            }
            for item in daily_stats
        }

        # Ensure all 7 days are in the response (use 0 for missing data)
        response_data = []
        for i in range(7):
            current_date = seven_days_ago + timedelta(days=i)
            day_abbr = current_date.strftime('%a')

            response_data.append(stats_map.get(day_abbr, {
                'day': day_abbr,
                'mood': 0,
                'energy': 0,
                'anxiety': 0,
            }))

        return Response(response_data)

# In soulcare_backend/moodtracker/views.py

from rest_framework import viewsets, permissions, generics
from .models import MoodEntry, Activity
from .serializers import MoodEntrySerializer, ActivitySerializer

class MoodEntryViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to view and create their own mood entries.
    """
    serializer_class = MoodEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        This view should return a list of all the mood entries
        for the currently authenticated user.
        """
        return MoodEntry.objects.filter(patient=self.request.user)

    def perform_create(self, serializer):
        """
        Assign the current user as the patient of the new mood entry.
        """
        serializer.save(patient=self.request.user)

class ActivityListView(generics.ListAPIView):
    """
    API endpoint to provide a list of all available activities.
    """
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    permission_classes = [permissions.IsAuthenticated]

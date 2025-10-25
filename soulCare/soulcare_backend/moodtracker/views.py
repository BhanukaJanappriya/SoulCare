# In soulcare_backend/moodtracker/views.py

from rest_framework import viewsets, permissions, generics
from .models import MoodEntry, Activity, Tag # NEW: import Tag
from .serializers import MoodEntrySerializer, ActivitySerializer, TagSerializer # NEW: import TagSerializer

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

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import ReactionTimeResult, MemoryGameResult, StroopGameResult
from .serializers import ReactionTimeResultSerializer, MemoryGameResultSerializer, StroopGameResultSerializer

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

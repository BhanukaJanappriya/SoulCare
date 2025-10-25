# journal/views.py

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q  # ✅ Add this import
from .models import JournalEntry, Tag
from .serializers import JournalEntrySerializer, TagSerializer
from django.http import HttpResponse

class JournalEntryViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows patients to manage their journal entries.
    """
    serializer_class = JournalEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        This view should return a list of all the journal entries
        for the currently authenticated user.
        """
        user = self.request.user

        # Ensure the user has a patient profile before querying
        if not hasattr(user, 'patientprofile'):
            return JournalEntry.objects.none()

        queryset = JournalEntry.objects.filter(patient=user.patientprofile)

        # --- Filtering Logic ---
        # 1. Search by title or content
        search_query = self.request.query_params.get('q', None)
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) | Q(content__icontains=search_query)  # ✅ Use Q directly
            )

        # 2. Filter by tags
        tag_names = self.request.query_params.get('tags', None)
        if tag_names:
            tag_list = tag_names.split(',')
            queryset = queryset.filter(tags__name__in=tag_list).distinct()

        return queryset

    def perform_create(self, serializer):
        """Associate the journal entry with the logged-in patient."""
        serializer.save(patient=self.request.user.patientprofile)

    @action(detail=False, methods=['get'], url_path='download')
    def download_journals(self, request):
        """Generates and returns a downloadable markdown file of all user's journals."""
        user = self.request.user
        if not hasattr(user, 'patientprofile'):
             return Response({"detail": "Patient profile not found."}, status=status.HTTP_404_NOT_FOUND)

        journals = JournalEntry.objects.filter(patient=user.patientprofile).order_by('created_at')

        # Build the markdown content
        content = f"# SoulCare Journal for {user.username}\n\n"
        for entry in journals:
            content += f"## {entry.title}\n"
            content += f"**Date:** {entry.created_at.strftime('%Y-%m-%d %H:%M')}\n"
            if entry.mood_emoji:
                content += f"**Mood:** {entry.mood_emoji}\n"
            if entry.tags.exists():
                tags_str = ", ".join([tag.name for tag in entry.tags.all()])
                content += f"**Tags:** {tags_str}\n"
            content += "\n"
            content += f"{entry.content}\n\n"
            content += "---\n\n"

        response = HttpResponse(content, content_type='text/markdown')
        response['Content-Disposition'] = 'attachment; filename="soulcare_journal.md"'
        return response

class TagViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that provides a list of all unique tags used by the patient.
    """
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return tags used by the current user's journal entries."""
        user = self.request.user
        if not hasattr(user, 'patientprofile'):
            return Tag.objects.none()
        return Tag.objects.filter(journal_entries__patient=user.patientprofile).distinct()

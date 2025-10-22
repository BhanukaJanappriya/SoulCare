# blog/views.py (MODIFIED)

from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework import status
from .models import BlogPost
from .serializers import BlogPostSerializer
from django.utils import timezone
from authapp.models import User # Use your actual User model

class BlogPostViewSet(viewsets.ModelViewSet):
    # 1. Define the queryset: get all blog posts
    queryset = BlogPost.objects.all()
    # 2. Define the serializer
    serializer_class = BlogPostSerializer

    # ***********************************
    # 3. Use DRF Permissions:
    # Allow GET (Read) requests for anyone (IsAuthenticatedOrReadOnly)
    # Require POST/PUT/DELETE for authenticated users
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    # ***********************************

    # Optional: Override the list method to allow filtering by status (like your tabs)
    def get_queryset(self):
        queryset = self.queryset
        # Only allow unauthenticated users to see 'published' posts
        if not self.request.user.is_authenticated:
            queryset = queryset.filter(status='published')

        # Authenticated users can filter by any status (published, draft, etc.)
        status_filter = self.request.query_params.get('status')
        if status_filter and status_filter != 'all':
            # Ensure an author only sees their own drafts/pending, but admins can see all
            if status_filter != 'published' and not self.request.user.is_superuser:
                 queryset = queryset.filter(author=self.request.user, status=status_filter)
            else:
                 queryset = queryset.filter(status=status_filter)

        return queryset.order_by('-createdAt')


    def perform_create(self, serializer):
        # ***********************************
        # 4. Set the Author automatically to the logged-in user!
        # This is where your JWT authentication pays off.
        # ***********************************
        author = self.request.user

        # Handle the status change to set publishedAt
        if serializer.validated_data.get('status') == 'published':
            # This logic should be here:
            if not serializer.instance or not serializer.instance.publishedAt:
                 serializer.validated_data['publishedAt'] = timezone.now()

        serializer.save(author=author)

    def perform_update(self, serializer):
        # Handle the status change to set publishedAt
        if serializer.validated_data.get('status') == 'published' and not serializer.instance.publishedAt:
             serializer.validated_data['publishedAt'] = timezone.now()

        serializer.save()

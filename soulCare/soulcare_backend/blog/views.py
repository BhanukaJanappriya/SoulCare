# blog/views.py (FINAL VERSION)

from rest_framework import viewsets, permissions
from .models import BlogPost
from .serializers import BlogPostSerializer
from .permissions import IsAuthorOrAdmin
from django.utils import timezone
from django.db.models import Q # For complex queries
from authapp.utils import send_blog_status_email

class BlogPostViewSet(viewsets.ModelViewSet):
    # Base queryset
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer

    # Permissions: Anyone can read (GET), logged-in can do CUD.
    # CUD is further restricted to the author or admin by IsAuthorOrAdmin.
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrAdmin]

    # Custom logic to determine which posts a user can see in the list view (GET request)
    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset.order_by('-createdAt')

        # 1. If user is NOT logged in, they can ONLY see published posts
        if not user.is_authenticated:
            return queryset.filter(status='published')

        # Get the status filter from the URL (e.g., ?status=pending)
        status_filter = self.request.query_params.get('status', 'all')

        # 2. If user is a Doctor, Counselor, or Admin: Full Management View
        if user.role in ['doctor', 'counselor', 'admin'] or user.is_superuser:
            # If a specific tab is selected, filter by that status
            if status_filter != 'all':
                return queryset.filter(status=status_filter)
            # If 'all' is selected, show everything
            return queryset

        # 3. If user is a Patient ('user' role): Combined View
        if user.role == 'user':
            # They can see everyone's published posts
            published_posts = queryset.filter(status='published')
            # They can see their own non-published posts (drafts, pending, rejected)
            personal_posts = queryset.filter(author=user).exclude(status='published')

            # Combine the two
            all_viewable_posts = published_posts.union(personal_posts).order_by('-createdAt')

            # Filter the combined set by the active tab status
            if status_filter == 'published':
                return published_posts.order_by('-createdAt')
            elif status_filter in ['draft', 'pending', 'rejected']:
                return personal_posts.filter(status=status_filter).order_by('-createdAt')

            # Default for 'all' tab for patients is their combined view
            return all_viewable_posts

        # Default fallback (should not be reached if roles are handled)
        return queryset.filter(status='published')

    # Logic to set the author automatically on creation
    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'user' and serializer.validated_data.get('status') != 'published':
            # Patient submits for review. We enforce 'pending' if they didn't try to publish.
            serializer.validated_data['status'] = 'pending'

        if serializer.validated_data.get('status') == 'published':
            serializer.validated_data['publishedAt'] = timezone.now()

        # Author is set to the logged-in user (request.user)
        serializer.save(author=self.request.user)

    # Logic to handle publishedAt update when status changes to 'published'
    def perform_update(self, serializer):
        instance = serializer.instance
        old_status = instance.status
        new_status = serializer.validated_data.get('status', old_status)

        # 1. Handle Publish Date
        if new_status == 'published' and not instance.publishedAt:
             serializer.validated_data['publishedAt'] = timezone.now()

        # 2. Save the changes
        serializer.save()

        # 3. Trigger Email if status changed to 'published' or 'rejected'
        if old_status != new_status and new_status in ['published', 'rejected']:
            # We pass the *updated* instance to the email function
            send_blog_status_email(instance, new_status)

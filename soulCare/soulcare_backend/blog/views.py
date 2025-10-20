from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import BlogPost
from .serializers import BlogPostSerializer
from django.utils import timezone

class BlogPostViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for viewing and editing blog posts.
    """
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filter queryset to only show posts for the authenticated user, unless they are an admin.
        """
        user = self.request.user
        if user.is_staff:
            return BlogPost.objects.all().order_by('-created_at')
        return BlogPost.objects.filter(author=user).order_by('-created_at')

    def perform_create(self, serializer):
        """
        Save the blog post with the authenticated user as the author.
        """
        serializer.save(author=self.request.user)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        # Handle status change to 'published'
        if 'status' in request.data and request.data['status'] == 'published' and not instance.published_at:
            instance.published_at = timezone.now()
        
        self.perform_update(serializer)
        return Response(serializer.data)
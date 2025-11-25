
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q, Avg
from django.shortcuts import get_object_or_404

from .models import BlogPost, BlogComment, BlogRating, BlogReaction
from .serializers import BlogPostSerializer, BlogCommentSerializer

class BlogCommentViewSet(viewsets.ModelViewSet):
    serializer_class = BlogCommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        post_pk = self.kwargs.get('blog_pk')
        if post_pk:
            return BlogComment.objects.filter(post_id=post_pk).order_by('-createdAt')
        return BlogComment.objects.none()

    def perform_create(self, serializer):
        post_pk = self.kwargs.get('blog_pk')
        post = get_object_or_404(BlogPost, pk=post_pk)
        
        if self.request.user.is_authenticated:
            serializer.save(author=self.request.user, post=post)
        else:
            serializer.save(post=post)


class BlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        qs = BlogPost.objects.all()

        # --- 1. SECURITY & VISIBILITY RULES ---
        
        # A. Admin/Staff: See EVERYTHING
        if user.is_authenticated and (user.is_staff or getattr(user, 'role', '') == 'admin'):
            pass 

        # B. Logged in User (Doctor/Patient): See Published + OWN drafts
        elif user.is_authenticated:
            qs = qs.filter(Q(status='published') | Q(author=user))

        # C. Guest (Not logged in): See ONLY Published
        else:
            qs = qs.filter(status='published')

        # --- 2. STATUS FILTER (Frontend Dropdown) ---
        status_param = self.request.query_params.get('status', 'all')
        if status_param != 'all':
            qs = qs.filter(status=status_param)

        # --- 3. SORTING LOGIC (For Patient Dashboard) ---
        sort_by = self.request.query_params.get('sort_by', 'newest')
        
        if sort_by == 'newest':
            qs = qs.order_by('-createdAt')
        elif sort_by == 'oldest':
            qs = qs.order_by('createdAt')
        elif sort_by == 'top_rated':
            # Annotate with average rating from DB, then sort
            qs = qs.annotate(calculated_avg=Avg('ratings__value')).order_by('-calculated_avg')

        return qs.distinct()

    def perform_create(self, serializer):
        user = self.request.user
        status_val = serializer.validated_data.get('status', 'draft')
        
        # Prevent regular users from publishing instantly (Auto-Pending)
        if hasattr(user, 'role') and user.role == 'user' and status_val == 'published':
            status_val = 'pending'

        if status_val == 'published':
             serializer.save(author=user, status=status_val, publishedAt=timezone.now())
        else:
             serializer.save(author=user, status=status_val)

    def perform_update(self, serializer):
        if serializer.validated_data.get('status') == 'published' and not serializer.instance.publishedAt:
             serializer.save(publishedAt=timezone.now())
        else:
             serializer.save()

    # --- RATE ACTION ---
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def rate(self, request, pk=None):
        post = self.get_object()
        val = request.data.get('rating')
        if not val:
            return Response({"detail": "Rating value required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            val = int(val)
            if not (1 <= val <= 5): raise ValueError
        except ValueError:
             return Response({"detail": "Rating must be an integer between 1 and 5"}, status=status.HTTP_400_BAD_REQUEST)

        BlogRating.objects.update_or_create(
            post=post,
            user=request.user,
            defaults={'value': val}
        )
        serializer = self.get_serializer(post)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # --- REACT ACTION ---
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def react(self, request, pk=None):
        post = self.get_object()
        r_type = request.data.get('type')
        if r_type not in ['like', 'heart', 'insightful']:
            return Response({"detail": "Invalid reaction type"}, status=status.HTTP_400_BAD_REQUEST)

        existing = BlogReaction.objects.filter(post=post, user=request.user).first()
        
        if existing and existing.reaction_type == r_type:
            existing.delete() 
        else:
            BlogReaction.objects.update_or_create(
                post=post,
                user=request.user,
                defaults={'reaction_type': r_type}
            )
        return Response({"status": "success"}, status=status.HTTP_200_OK)






from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import BlogPost, BlogComment, BlogRating, BlogReaction
from .serializers import BlogPostSerializer, BlogCommentSerializer
from .permissions import IsAuthorOrAdmin # Assuming you have a permissions file
from django.utils import timezone
from django.db.models import Q, Avg, Count # Added Avg, Count
from authapp.utils import send_blog_status_email

# --- NEW VIEWSETS FOR COMMENTS, RATINGS, REACTIONS ---

class BlogCommentViewSet(viewsets.ModelViewSet):
    """
    CRUD for Blog Comments. Nested under /api/blogs/<blog_pk>/comments/.
    """
    serializer_class = BlogCommentSerializer
    # Anyone who is logged in can comment/read comments
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # Filter comments for a specific post (obtained from the URL)
        post_pk = self.kwargs.get('blog_pk')
        if post_pk:
            return BlogComment.objects.filter(post=post_pk).order_by('createdAt')
        # Allow viewing all comments only to Admin
        elif self.request.user.is_superuser:
            return BlogComment.objects.all().order_by('createdAt')
        return BlogComment.objects.none()

    def perform_create(self, serializer):
        # Automatically set the author to the logged-in user and the post from the URL
        post_pk = self.kwargs.get('blog_pk')
        try:
            post = BlogPost.objects.get(pk=post_pk)
            # You need the 'serializers' module to raise ValidationError here,
            # so we'll import it correctly *only* for the validation part.
            from . import serializers as blog_serializers # Correct relative import
            serializer.save(author=self.request.user, post=post)
        except BlogPost.DoesNotExist:
            # Note: We need to import the ValidationError from the rest_framework.serializers module
            from rest_framework import serializers as rf_serializers
            raise rf_serializers.ValidationError("Blog post not found.")

    def perform_destroy(self, instance):
        # Allow deletion only if the user is the comment author or an Admin/Superuser
        if self.request.user == instance.author or self.request.user.role == 'admin' or self.request.user.is_superuser:
            instance.delete()
        else:
            raise permissions.PermissionDenied("You do not have permission to delete this comment.")

class BlogRatingViewSet(viewsets.ViewSet):
    """
    Handles user rating submissions. Users can only POST/PUT/DELETE, not GET a list.
    """
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='rate')
    def rate_post(self, request, blog_pk=None):
        try:
            post = BlogPost.objects.get(pk=blog_pk)
        except BlogPost.DoesNotExist:
            return Response({"detail": "Blog post not found."}, status=404)

        value = request.data.get('rating')
        if not value or not 1 <= int(value) <= 5:
            return Response({"detail": "Rating must be a value between 1 and 5."}, status=400)

        rating_value = int(value)

        # Check if user has already rated this post
        rating, created = BlogRating.objects.update_or_create(
            post=post,
            user=request.user,
            defaults={'value': rating_value}
        )

        if created:
            return Response({"detail": "Rating added successfully."}, status=201)
        else:
            return Response({"detail": "Rating updated successfully."}, status=200)

    @action(detail=False, methods=['delete'], url_path='unrate')
    def unrate_post(self, request, blog_pk=None):
        try:
            post = BlogPost.objects.get(pk=blog_pk)
            rating = BlogRating.objects.get(post=post, user=request.user)
            rating.delete()
            return Response({"detail": "Rating removed successfully."}, status=204)
        except BlogPost.DoesNotExist:
            return Response({"detail": "Blog post not found."}, status=404)
        except BlogRating.DoesNotExist:
            return Response({"detail": "You have not rated this post."}, status=404)

class BlogReactionViewSet(viewsets.ViewSet):
    """
    Handles user reactions (like/love/insightful) submissions.
    """
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='react')
    def react_post(self, request, blog_pk=None):
        try:
            post = BlogPost.objects.get(pk=blog_pk)
        except BlogPost.DoesNotExist:
            return Response({"detail": "Blog post not found."}, status=404)

        reaction_type = request.data.get('type') # e.g., 'like', 'love'
        valid_types = [t[0] for t in BlogReaction.REACTION_CHOICES]

        if reaction_type not in valid_types:
            return Response({"detail": "Invalid reaction type."}, status=400)

        # Update or create the reaction
        reaction, created = BlogReaction.objects.update_or_create(
            post=post,
            user=request.user,
            defaults={'type': reaction_type}
        )

        if created:
            return Response({"detail": f"Reaction '{reaction_type}' added successfully."}, status=201)
        else:
            return Response({"detail": f"Reaction updated to '{reaction_type}'."}, status=200)

    @action(detail=False, methods=['delete'], url_path='unreact')
    def unreact_post(self, request, blog_pk=None):
        try:
            post = BlogPost.objects.get(pk=blog_pk)
            reaction = BlogReaction.objects.get(post=post, user=request.user)
            reaction.delete()
            return Response({"detail": "Reaction removed successfully."}, status=204)
        except BlogPost.DoesNotExist:
            return Response({"detail": "Blog post not found."}, status=404)
        except BlogReaction.DoesNotExist:
            return Response({"detail": "You have not reacted to this post."}, status=404)


# --- MAIN BLOG VIEWSET (MODIFIED FOR SORTING) ---

class BlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrAdmin]

    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset

        # --- 1. Base Filtering Logic (Keep as is) ---

        # If user is NOT logged in, they can ONLY see published posts
        if not user.is_authenticated:
            queryset = queryset.filter(status='published')
        else:
            status_filter = self.request.query_params.get('status', 'all')

            if user.role in ['doctor', 'counselor', 'admin'] or user.is_superuser:
                if status_filter != 'all':
                    queryset = queryset.filter(status=status_filter)
            elif user.role == 'user':
                published_posts = queryset.filter(status='published')
                personal_posts = queryset.filter(author=user).exclude(status='published')

                # Use Q objects and union to combine and avoid duplicates
                q_combined = Q(status='published') | Q(author=user, status__in=['draft', 'pending', 'rejected'])
                queryset = queryset.filter(q_combined).distinct()

                if status_filter == 'published':
                    queryset = published_posts
                elif status_filter in ['draft', 'pending', 'rejected']:
                    queryset = personal_posts.filter(status=status_filter)

        # --- 2. Sorting Logic (NEW) ---

        sort_by = self.request.query_params.get('sort_by', '-createdAt') # Default to newest

        # Mapping frontend sort param to Django model field/aggregation
        sort_mapping = {
            'newest': '-createdAt',
            'oldest': 'createdAt',
            # Requires annotation, only apply sorting if the queryset is filtered to published posts
            # to keep the logic simple and fast for the common case.
            'top_rated': '-average_rating',
        }

        order_field = sort_mapping.get(sort_by)

        if order_field == '-average_rating':
             # Only published posts can be rated meaningfully, ensure this is only for published content
            if queryset.filter(status='published').exists():
                 # Annotate the queryset with the average rating before ordering
                 queryset = queryset.annotate(average_rating=Avg('ratings__value')).order_by(order_field, '-createdAt')
            else:
                 # Fallback to newest if no published posts exist or rating cannot be calculated
                 queryset = queryset.order_by('-createdAt')
        else:
            # Apply standard field ordering
            queryset = queryset.order_by(order_field)

        return queryset

    # Logic to set the author automatically on creation (Keep as is)
    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'user' and serializer.validated_data.get('status') != 'published':
            serializer.validated_data['status'] = 'pending'

        if serializer.validated_data.get('status') == 'published':
            serializer.validated_data['publishedAt'] = timezone.now()

        serializer.save(author=self.request.user)

    # Logic to handle publishedAt update when status changes to 'published' (Keep as is)
    def perform_update(self, serializer):
        instance = serializer.instance
        old_status = instance.status
        new_status = serializer.validated_data.get('status', old_status)

        if new_status == 'published' and not instance.publishedAt:
             serializer.validated_data['publishedAt'] = timezone.now()

        serializer.save()

        if old_status != new_status and new_status in ['published', 'rejected']:
            send_blog_status_email(instance, new_status)

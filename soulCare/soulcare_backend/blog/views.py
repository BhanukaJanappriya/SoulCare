# # blog/views.py

# from rest_framework import viewsets, permissions, status
# from rest_framework.response import Response
# from rest_framework.decorators import action
# from .models import BlogPost, BlogRating
# from .serializers import BlogPostSerializer, BlogRatingSerializer
# from .permissions import IsAuthorOrAdmin
# from django.utils import timezone
# from django.db.models import Q

# class BlogPostViewSet(viewsets.ModelViewSet):
#     queryset = BlogPost.objects.all()
#     serializer_class = BlogPostSerializer
#     permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrAdmin]

#     def get_queryset(self):
#         user = self.request.user
#         queryset = self.queryset.order_by('-createdAt')
#         status_filter = self.request.query_params.get('status', 'all')

#         if not user.is_authenticated:
#             return queryset.filter(status='published')

#         if user.role in ['doctor', 'counselor', 'admin'] or user.is_superuser:
#             if status_filter != 'all':
#                 return queryset.filter(status=status_filter)
#             return queryset

#         if user.role == 'user':
#             published_posts = queryset.filter(status='published')
#             personal_posts = queryset.filter(author=user).exclude(status='published')
#             all_viewable_posts = published_posts.union(personal_posts).order_by('-createdAt')

#             if status_filter == 'published':
#                 return published_posts.order_by('-createdAt')
#             elif status_filter in ['draft', 'pending', 'rejected']:
#                 return personal_posts.filter(status=status_filter).order_by('-createdAt')
#             return all_viewable_posts

#         return queryset.filter(status='published')

#     def perform_create(self, serializer):
#         user = self.request.user
#         # Enforce that patients submit posts as 'pending'
#         if user.role == 'user':
#             serializer.validated_data['status'] = 'pending'
        
#         if serializer.validated_data.get('status') == 'published':
#             serializer.validated_data['publishedAt'] = timezone.now()

#         serializer.save(author=self.request.user)

#     def perform_update(self, serializer):
#         # Set publishedAt date if a post's status is changed to 'published'
#         if serializer.validated_data.get('status') == 'published' and not serializer.instance.publishedAt:
#              serializer.validated_data['publishedAt'] = timezone.now()
#         serializer.save()

#     # --- START: NEW ACTION TO HANDLE RATING SUBMISSIONS ---
#     @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
#     def rate(self, request, pk=None):
#         """
#         Allows an authenticated user to rate or update their rating for a blog post.
#         """
#         post = self.get_object()
#         user = request.user
        
#         serializer = BlogRatingSerializer(data=request.data)
#         if serializer.is_valid():
#             rating_value = serializer.validated_data['rating']
            
#             # Use update_or_create to handle both new and existing ratings in one step.
#             # This is very efficient and clean.
#             rating_obj, created = BlogRating.objects.update_or_create(
#                 post=post,
#                 user=user,
#                 defaults={'rating': rating_value}
#             )
            
#             # After saving the rating, return the full, updated blog post object
#             # so the frontend can update its state instantly.
#             updated_post_serializer = self.get_serializer(post)
#             return Response(updated_post_serializer.data, status=status.HTTP_200_OK)
#         else:
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#     # --- END: NEW ACTION ---





# blogs/views.py

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import BlogPost, BlogRating
from .serializers import BlogPostSerializer, BlogRatingSerializer
from .permissions import IsAuthorOrAdmin
from django.utils import timezone
from django.db.models import Q

class BlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrAdmin]

    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset.order_by('-createdAt')
        status_filter = self.request.query_params.get('status', 'all')
        if not user.is_authenticated:
            return queryset.filter(status='published')
        if user.role in ['doctor', 'counselor', 'admin'] or user.is_superuser:
            if status_filter != 'all':
                return queryset.filter(status=status_filter)
            return queryset
        if user.role == 'user':
            published_posts = queryset.filter(status='published')
            personal_posts = queryset.filter(author=user).exclude(status='published')
            all_viewable_posts = published_posts.union(personal_posts).order_by('-createdAt')
            if status_filter == 'published':
                return published_posts.order_by('-createdAt')
            elif status_filter in ['draft', 'pending', 'rejected']:
                return personal_posts.filter(status=status_filter).order_by('-createdAt')
            return all_viewable_posts
        return queryset.filter(status='published')

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'user':
            serializer.validated_data['status'] = 'pending'
        if serializer.validated_data.get('status') == 'published':
            serializer.validated_data['publishedAt'] = timezone.now()
        serializer.save(author=self.request.user)

    def perform_update(self, serializer):
        if serializer.validated_data.get('status') == 'published' and not serializer.instance.publishedAt:
             serializer.validated_data['publishedAt'] = timezone.now()
        serializer.save()

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def rate(self, request, pk=None):
        post = self.get_object()
        user = request.user
        serializer = BlogRatingSerializer(data=request.data)
        if serializer.is_valid():
            rating_obj, created = BlogRating.objects.update_or_create(
                post=post, user=user,
                defaults={'rating': serializer.validated_data['rating']}
            )
            updated_post_serializer = self.get_serializer(post)
            return Response(updated_post_serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
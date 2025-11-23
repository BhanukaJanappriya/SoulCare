from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import BlogPostViewSet, BlogCommentViewSet, BlogRatingViewSet, BlogReactionViewSet

router = DefaultRouter()
# /api/blogs/
router.register(r'blogs', BlogPostViewSet, basename='blogpost')

# We use path() for nested routes
urlpatterns = [
    # Main blog endpoints
    path('', include(router.urls)),

    # Nested endpoints for Comments, Ratings, Reactions
    # /api/blogs/{blog_pk}/comments/
    path('blogs/<int:blog_pk>/comments/', BlogCommentViewSet.as_view({'get': 'list', 'post': 'create'}), name='blogpost-comments-list'),
    path('blogs/<int:blog_pk>/comments/<int:pk>/', BlogCommentViewSet.as_view({'delete': 'destroy'}), name='blogpost-comments-detail'),

    # /api/blogs/{blog_pk}/ratings/rate/
    path('blogs/<int:blog_pk>/ratings/rate/', BlogRatingViewSet.as_view({'post': 'rate_post'}), name='blogpost-rate'),
    path('blogs/<int:blog_pk>/ratings/unrate/', BlogRatingViewSet.as_view({'delete': 'unrate_post'}), name='blogpost-unrate'),

    # /api/blogs/{blog_pk}/reactions/react/
    path('blogs/<int:blog_pk>/reactions/react/', BlogReactionViewSet.as_view({'post': 'react_post'}), name='blogpost-react'),
    path('blogs/<int:blog_pk>/reactions/unreact/', BlogReactionViewSet.as_view({'delete': 'unreact_post'}), name='blogpost-unreact'),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BlogPostViewSet, BlogCommentViewSet

router = DefaultRouter()
router.register(r'blogs', BlogPostViewSet, basename='blogpost')

urlpatterns = [
    path('', include(router.urls)),

    # Manual routes for nested comments
    path('blogs/<int:blog_pk>/comments/', 
         BlogCommentViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='blog-comments-list'),
         
    path('blogs/<int:blog_pk>/comments/<int:pk>/', 
         BlogCommentViewSet.as_view({'delete': 'destroy'}), 
         name='blog-comments-delete'),
]
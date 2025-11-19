# soulcare_backend/content/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContentViewSet, SharedWithMeView

router = DefaultRouter()
# Registers /api/content/ (list, create)
# Registers /api/content/<pk>/ (retrieve, delete, update)
# Registers /api/content/<pk>/share/ (custom action)
router.register('', ContentViewSet, basename='content')

urlpatterns = [
    # This is for patients
    path('shared-with-me/', SharedWithMeView.as_view(), name='content-shared-with-me'),
    
    # This is for providers
    path('', include(router.urls)),
]
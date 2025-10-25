# In soulcare_backend/moodtracker/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MoodEntryViewSet, ActivityListView

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'entries', MoodEntryViewSet, basename='moodentry')

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
    path('activities/', ActivityListView.as_view(), name='activity-list'),
]

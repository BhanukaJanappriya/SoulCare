# In soulcare_backend/moodtracker/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MoodEntryViewSet, ActivityListView, TagListView, WeeklyMoodStatsView
# NEW: import TagListView

router = DefaultRouter()
router.register(r'entries', MoodEntryViewSet, basename='moodentry')

urlpatterns = [
    path('', include(router.urls)),
    path('activities/', ActivityListView.as_view(), name='activity-list'),
    # NEW: Add the URL for the tags list
    path('tags/', TagListView.as_view(), name='tag-list'),
    path('weekly-stats/', WeeklyMoodStatsView.as_view(), name='weekly-mood-stats'),

]

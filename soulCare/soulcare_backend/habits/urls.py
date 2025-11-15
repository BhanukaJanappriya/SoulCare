# soulcare_backend/habits/urls.py

from rest_framework.routers import DefaultRouter
from .views import HabitViewSet

router = DefaultRouter()
router.register(r'habits', HabitViewSet, basename='habit')

urlpatterns = router.urls

# This will create routes like:
# GET /api/habits/ -> List habits
# POST /api/habits/ -> Create habit
# GET /api/habits/1/ -> Retrieve habit
# PATCH/PUT /api/habits/1/ -> Update habit
# DELETE /api/habits/1/ -> Delete habit
# POST /api/habits/1/toggle_completion/ -> Toggle completion

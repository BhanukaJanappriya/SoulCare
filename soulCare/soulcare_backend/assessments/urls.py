# soulcare_backend/assessments/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AssessmentViewSet

router = DefaultRouter()
# Note: Since the viewset is GenericViewSet, we only register the basename
# The URLs will be:
# /api/assessments/latest-questions/
# /api/assessments/submit-response/
# /api/assessments/history/
router.register(r'assessments', AssessmentViewSet, basename='assessment')

urlpatterns = [
    path('', include(router.urls)),
]

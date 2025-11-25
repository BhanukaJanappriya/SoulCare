# soulcare_backend/assessments/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
# CORRECT THE IMPORT NAME:
from .views import AdaptiveAssessmentView, AssessmentViewSet

router = DefaultRouter()
router.register(r'assessments', AssessmentViewSet, basename='assessment')

urlpatterns = [
    path('', include(router.urls)),
    # These paths now correctly refer to the imported AdaptiveAssessmentView class
    path('adaptive/questions/', AdaptiveAssessmentView.as_view(), name='adaptive-questions'),
    path('adaptive/submit/', AdaptiveAssessmentView.as_view(), name='adaptive-submit'),
]

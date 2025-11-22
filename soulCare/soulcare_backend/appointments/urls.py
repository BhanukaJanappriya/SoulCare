from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AppointmentViewSet,ProgressNoteViewSet

router = DefaultRouter()
router.register('notes', ProgressNoteViewSet, basename='progress-note')
router.register(r'', AppointmentViewSet, basename='appointment')

urlpatterns = [path('', include(router.urls))]
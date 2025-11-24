from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FeedbackViewSet

router = DefaultRouter()
router.register(r'', FeedbackViewSet, basename='feedback')

urlpatterns = [
    # Manually register the action URLs BEFORE the router include to ensure they are matched
    # Include the router for standard list/create/retrieve/update/delete
    path('', include(router.urls)),
]
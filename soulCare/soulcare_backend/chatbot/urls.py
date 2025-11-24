# soulcare_backend/chatbot/urls.py

from django.urls import path
from .views import ChatbotMessageView

urlpatterns = [
    # Maps POST requests to the ChatbotMessageView
    path('message/', ChatbotMessageView.as_view(), name='chatbot-message'),
]

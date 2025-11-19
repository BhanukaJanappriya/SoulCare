# soulcare_backend/chatbot/urls.py

from django.urls import path
from .views import ChatbotMessageView

urlpatterns = [
    # API endpoint to send a message to the bot and get a response
    path('send/', ChatbotMessageView.as_view(), name='chatbot-send'),
]

# This creates the endpoint: POST /api/chatbot/send/

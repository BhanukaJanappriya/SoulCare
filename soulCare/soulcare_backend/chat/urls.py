# soulcare_backend/chat/urls.py
# (This is a NEW FILE)

from django.urls import path
from .views import ContactListView, MessageListView,MessageDetailView

urlpatterns = [
    # /api/chat/contacts/
    path('contacts/', ContactListView.as_view(), name='chat-contact-list'),
    
    # /api/chat/conversations/123/messages/
    path('conversations/<int:conversation_id>/messages/', MessageListView.as_view(), name='chat-message-list'),
    
    # /api/chat/messages/456/ (for DELETING a message)
    path('messages/<int:pk>/', MessageDetailView.as_view(), name='message-detail'),
]
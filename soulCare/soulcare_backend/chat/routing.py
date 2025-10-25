# soulcare_backend/chat/routing.py
# (This is a NEW FILE)

from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # This regex matches ws/chat/123/ (where 123 is the conversation_id)
    re_path(
        'ws/chat/(?P<conversation_id>\d+)/$', 
        consumers.ChatConsumer.as_asgi()
    ),
]
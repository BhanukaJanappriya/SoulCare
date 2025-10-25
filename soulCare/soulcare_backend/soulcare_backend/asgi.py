# soulcare_backend/soulcare_backend/asgi.py

import os
import django
from django.core.asgi import get_asgi_application

# --- CRITICAL ---
# These lines MUST come BEFORE any other Django imports
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'soulcare_backend.settings')
django.setup()
# --- END CRITICAL ---

# Now it is safe to import channels and your chat app
from channels.routing import ProtocolTypeRouter, URLRouter
from chat.middleware import TokenAuthMiddleware
import chat.routing

# This function must be called *after* django.setup()
django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    # HTTP requests will be handled by the normal Django ASGI application
    "http": django_asgi_app,

    # WebSocket requests will be handled by our auth and routing
    "websocket": TokenAuthMiddleware(
        URLRouter(
            # Get the WebSocket URL patterns from your chat app
            chat.routing.websocket_urlpatterns
        )
    ),
})
# soulcare_backend/chat/middleware.py
# (This is a NEW FILE)

from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from authapp.models import User
from urllib.parse import parse_qs

@database_sync_to_async
def get_user_from_token(token_key):
    """
    Asynchronously gets a user from a JWT access token.
    """
    try:
        # Validate the token
        token = AccessToken(token_key)
    except (InvalidToken, TokenError):
        return AnonymousUser()

    try:
        # Get the user ID from the token
        user_id = token['user_id']
        
        # Fetch the user AND their profile in one query. This is more efficient
        # and ensures the profile is available on the user object.
        user = User.objects.select_related(
            'patientprofile', 'doctorprofile', 'counselorprofile'
        ).get(id=user_id)
        
        return user
    except User.DoesNotExist:
        return AnonymousUser()
    except Exception:
        return AnonymousUser()

class TokenAuthMiddleware(BaseMiddleware):
    """
    Custom middleware that takes a token from the query string
    and authenticates the user for a WebSocket connection.
    """

    async def __call__(self, scope, receive, send):
        # scope['query_string'] is a byte string, e.g., b'token=abcdef'
        # parse_qs decodes it into a dictionary
        query_params = parse_qs(scope.get("query_string", b"").decode("utf-8"))
        token = query_params.get("token")

        if token:
            # Get the first token in the list
            token_key = token[0]
            # Get the user asynchronously
            scope['user'] = await get_user_from_token(token_key)
        else:
            scope['user'] = AnonymousUser()

        # Continue processing the request
        return await super().__call__(scope, receive, send)
      

# soulcare_backend/chatbot/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
# Import the main function from your newly created service file
from .deepseek_hybrid_service import get_chatbot_response
from rest_framework.permissions import IsAuthenticated # Recommended for security

class ChatbotMessageView(APIView):
    """
    API endpoint to receive user messages, perform safety checks,
    and call the DeepSeek generative model for a response.
    """
    # Only allow authenticated users to hit this endpoint
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # 1. Extract the user message from the JSON request body (request.data)
        user_message = request.data.get('message')

        # Validation Check
        if not user_message:
            return Response(
                {"error": "Message field is required in the request body."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # 2. Call the hybrid service function
            # This handles NLTK safety checks AND the DeepSeek API call
            bot_response = get_chatbot_response(user_message)

            # 3. Return the response in JSON format
            return Response({"response": bot_response}, status=status.HTTP_200_OK)

        except ValueError as e:
             # Catches issues like missing API key (raised in the service file)
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            # Catches unexpected errors (e.g., connection issues)
            print(f"Chatbot API Processing Error: {e}")
            return Response(
                {"response": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

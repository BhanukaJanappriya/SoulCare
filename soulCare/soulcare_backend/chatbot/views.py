# soulcare_backend/chatbot/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .serializers import UserInputSerializer, BotResponseSerializer

# Helper function to encapsulate the chatbot's logic
def generate_bot_response(user_input: str) -> str:
    """Replicates the logic from the frontend's generateBotResponse."""
    input_text = user_input.lower()

    if "anxious" in input_text or "anxiety" in input_text:
        return "I understand you're feeling anxious. Try the 4-7-8 breathing technique: breathe in for 4 counts, hold for 7, and exhale for 8. Would you like me to guide you through this exercise?"
    elif "sad" in input_text or "depressed" in input_text or "down" in input_text:
        return "I'm sorry you're feeling this way. It's okay to have difficult emotions. Try going for a short walk, listening to music, or reaching out to a friend. Remember to be kind to yourself."
    elif "sleep" in input_text or "insomnia" in input_text:
        return "Sleep difficulties can impact your well-being. Try maintaining a consistent bedtime routine and avoiding screens before bed. Would you like me to walk you through a relaxation exercise?"
    elif "stress" in input_text or "overwhelmed" in input_text:
        return "Feeling stressed or overwhelmed is challenging. Let's break this down: What specific situations are causing you stress? In the meantime, try the 5-4-3-2-1 grounding technique."
    elif "breathing" in input_text or "breathe" in input_text:
        return "Breathing exercises are wonderful for managing stress and anxiety. Let's try box breathing: breathe in for 4 counts, hold for 4, breathe out for 4, hold for 4. Are you ready to try this together?"
    elif "motivation" in input_text or "unmotivated" in input_text:
        return "Lack of motivation is completely normal. Start small - choose one tiny task you can accomplish today. Success builds momentum! What's one small step you could take today?"
    else:
        return "Thank you for sharing that with me. I'm here to listen and support you. Your feelings are valid. Is there a specific area where you'd like support today?"


class ChatbotMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # 1. Enforce Role: Only 'user' (Patient) can access the companion bot
        if request.user.role != 'user':
            return Response(
                {"detail": "Only patients are allowed to use the companion chatbot."},
                status=status.HTTP_403_FORBIDDEN
            )

        # 2. Validate incoming data
        serializer = UserInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user_message = serializer.validated_data['message']

        # 3. Generate Bot Response
        bot_response_content = generate_bot_response(user_message)

        # 4. Serialize and return
        response_serializer = BotResponseSerializer(data={'message': bot_response_content})
        response_serializer.is_valid() # Should always be valid given the logic

        return Response(response_serializer.data, status=status.HTTP_200_OK)

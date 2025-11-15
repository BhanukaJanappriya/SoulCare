# soulcare_backend/habits/views.py

from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Habit
from .serializers import HabitSerializer, HabitToggleSerializer
from datetime import date, timedelta

class HabitViewSet(viewsets.ModelViewSet):
    serializer_class = HabitSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Ensures users can only see their own habits.
        Also, filters for only 'user' role (Patients).
        """
        if self.request.user.is_authenticated and self.request.user.role == 'user':
            return Habit.objects.filter(user=self.request.user)
        return Habit.objects.none()

    def perform_create(self, serializer):
        """
        Sets the user (owner) of the habit to the logged-in user.
        """
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], serializer_class=HabitToggleSerializer)
    def toggle_completion(self, request, pk=None):
        """
        Custom action to mark a habit as completed or uncompleted for the current day.
        Includes basic streak and current progress logic.
        """
        habit = self.get_object() # Fetches the specific habit for the logged-in user
        serializer = HabitToggleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        completed = serializer.validated_data['completed']

        today = date.today()

        if completed:
            # Mark as completed
            if not habit.completed_today:
                habit.completed_today = True
                habit.current += 1

                # Update streak logic
                if habit.last_completed == today - timedelta(days=1):
                    # Continued the streak
                    habit.streak += 1
                elif habit.last_completed is None or habit.last_completed < today - timedelta(days=1):
                    # Started a new streak
                    habit.streak = 1

                habit.last_completed = today
                habit.save()
                return Response({'status': 'Habit marked as completed', 'habit': HabitSerializer(habit).data})
            else:
                return Response({'status': 'Habit was already completed today'}, status=status.HTTP_200_OK)

        else:
            # Mark as uncompleted
            if habit.completed_today:
                habit.completed_today = False
                habit.current = max(0, habit.current - 1)

                # Simple streak reset/decrement logic for unmarking
                # Note: Real-world streak logic is complex, this is a basic reversal
                if habit.last_completed == today:
                    habit.last_completed = None # Reset last_completed if it was today
                    habit.streak = max(0, habit.streak - 1)

                habit.save()
                return Response({'status': 'Habit marked as uncompleted', 'habit': HabitSerializer(habit).data})
            else:
                return Response({'status': 'Habit was already uncompleted today'}, status=status.HTTP_200_OK)

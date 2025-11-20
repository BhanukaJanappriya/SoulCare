from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q, Case, When, Value, IntegerField
from django.utils import timezone
from datetime import date, timedelta
from .models import Habit, HabitTask, HabitTaskCompletion, FREQUENCY_CHOICES
from .serializers import (
    HabitSerializer,
    HabitTaskSerializer,
    HabitTaskCreationSerializer,
)

from .utils import get_period_start_date, get_previous_period_range

# =================================================================
# --- UTILITY FUNCTIONS FOR PERIOD CALCULATION ---
# =================================================================

def get_period_start_date(frequency: str, check_date: date = None) -> date:
    """Calculates the start date of the current (or specified) tracking period."""
    if check_date is None:
        check_date = date.today()

    if frequency == 'daily':
        return check_date
    elif frequency == 'weekly':
        # Start of the week (assuming Monday=0, Sunday=6)
        return check_date - timedelta(days=check_date.weekday())
    elif frequency == 'monthly':
        # Start of the month
        return date(check_date.year, check_date.month, 1)
    return check_date

def get_previous_period_range(frequency: str, check_date: date = None) -> tuple[date, date]:
    """Calculates the start and end date of the *previous* tracking period."""
    if check_date is None:
        check_date = date.today()

    if frequency == 'daily':
        end_date = check_date - timedelta(days=1)
        start_date = end_date
    elif frequency == 'weekly':
        current_start = get_period_start_date('weekly', check_date)
        end_date = current_start - timedelta(days=1)
        start_date = current_start - timedelta(weeks=1)
    elif frequency == 'monthly':
        current_start = get_period_start_date('monthly', check_date)
        end_date = current_start - timedelta(days=1)
        start_date = date(end_date.year, end_date.month, 1)
    else:
        # Default to previous day
        end_date = check_date - timedelta(days=1)
        start_date = end_date

    return start_date, end_date


# =================================================================
# --- CORE HABIT VIEWSET (Modified) ---
# =================================================================

class HabitViewSet(viewsets.ModelViewSet):
    serializer_class = HabitSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Ensures users can only see their own habits and filters for 'user' role.
        """
        if self.request.user.is_authenticated and self.request.user.role == 'user':
            return Habit.objects.filter(user=self.request.user).prefetch_related('tasks__completions')
        return Habit.objects.none()

    def perform_create(self, serializer):
        """
        Sets the user (owner) of the habit to the logged-in user.
        Initializes a default HabitTask if the habit's target is 1 and no tasks are created.
        """
        habit = serializer.save(user=self.request.user)

        # If no tasks are specified, create a default task with the same name as the habit
        # This ensures every habit can be tracked via the HabitTaskCompletion model.
        if habit.target == 1 and habit.tasks.count() == 0:
            HabitTask.objects.create(
                habit=habit,
                name=f"Complete {habit.name}"
            )
            # Update target to 1 (number of tasks)
            habit.target = 1
            habit.save()


    # =================================================================
    # --- HABIT TASK MANAGEMENT ACTIONS ---
    # =================================================================

    @action(detail=True, methods=['post'], url_path='tasks')
    def create_task(self, request, pk=None):
        """
        Creates a new HabitTask under a specific Habit.
        """
        habit = self.get_object()
        serializer = HabitTaskCreationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Create the new task
        task = serializer.save(habit=habit)

        # After adding a task, update the parent Habit's target to the total number of tasks
        habit.target = habit.tasks.count()
        habit.save()

        return Response(HabitTaskSerializer(task, context={'request': request}).data, status=status.HTTP_201_CREATED)

    # =================================================================
    # --- TOGGLE COMPLETION ACTION (on HabitTask) ---
    # =================================================================

    @action(detail=False, methods=['post'], url_path='tasks/(?P<task_id>\d+)/toggle')
    def toggle_task_completion(self, request, task_id=None):
        try:
            task = HabitTask.objects.get(id=task_id, habit__user=request.user)
        except HabitTask.DoesNotExist:
            return Response({'detail': 'Task not found.'}, status=status.HTTP_404_NOT_FOUND)

        habit = task.habit
        serializer_data = request.data.get('completed')

        if serializer_data is None:
             return Response({'detail': 'Field "completed" is required.'}, status=status.HTTP_400_BAD_REQUEST)

        completed = bool(serializer_data)
        today = date.today()

        period_start_date = get_period_start_date(habit.frequency, today)
        period_start_datetime = timezone.make_aware(timezone.datetime.combine(period_start_date, timezone.datetime.min.time()))

        current_completion_qs = task.completions.filter(completed_at__gte=period_start_datetime)
        is_completed_in_period = current_completion_qs.exists()

        if completed and not is_completed_in_period:
            HabitTaskCompletion.objects.create(task=task)
            status_message = 'Task marked as completed'
        elif not completed and is_completed_in_period:
            most_recent_completion = current_completion_qs.order_by('-completed_at').first()
            if most_recent_completion:
                most_recent_completion.delete()
                status_message = 'Task marked as uncompleted'
            else:
                 return Response({'detail': 'Task already uncompleted.'}, status=status.HTTP_200_OK)
        else:
            return Response({'detail': f'Task already {"completed" if completed else "uncompleted"}.'}, status=status.HTTP_200_OK)

        # Streak Logic (already good)
        # Note: We must re-fetch 'habit' or use the serializer data before the habit.save() for streaks
        habit_serializer = HabitSerializer(habit, context={'request': request})
        current_completions = habit_serializer.data['current']
        total_tasks = habit.tasks.count() or habit.target

        is_fully_completed_now = current_completions >= total_tasks

        if is_fully_completed_now and completed:
             # ... (existing streak logic) ...
             if habit.frequency == 'daily':
                 if habit.last_completed_period_end == today - timedelta(days=1):
                     habit.streak += 1
                 elif habit.last_completed_period_end is None or habit.last_completed_period_end < today - timedelta(days=1):
                     habit.streak = 1
                 habit.last_completed_period_end = today
                 habit.save()

        elif not is_fully_completed_now and not completed:
             # ... (existing uncompletion streak logic) ...
             if habit.last_completed_period_end == today:
                 habit.last_completed_period_end = None
                 habit.streak = max(0, habit.streak - 1)
                 habit.save()

        # Re-serialize the Habit to include the latest 'current', 'completedToday', and 'streak'
        # The serializer uses the corrected logic (no recursion) to get all dynamic fields.
        updated_habit_data = HabitSerializer(habit, context={'request': request}).data

        # --- FIX IS HERE: Return the full updated habit data ---
        return Response({
            'status': status_message,
            'habit': updated_habit_data
        }, status=status.HTTP_200_OK)

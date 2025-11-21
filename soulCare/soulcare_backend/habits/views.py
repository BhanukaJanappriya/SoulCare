from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q
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
# --- CORE HABIT VIEWSET ---
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

        if habit.target == 1 and habit.tasks.count() == 0:
            HabitTask.objects.create(
                habit=habit,
                name=f"Complete {habit.name}"
            )
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

        task = serializer.save(habit=habit)

        habit.target = habit.tasks.count()
        habit.save()

        return Response(HabitTaskSerializer(task, context={'request': request}).data, status=status.HTTP_201_CREATED)

    # =================================================================
    # --- TOGGLE COMPLETION ACTION (on HabitTask) ---
    # =================================================================

    @action(detail=False, methods=['post'], url_path=r'tasks/(?P<task_id>\d+)/toggle') # FIX 4: Used raw string r''
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
        habit_serializer = HabitSerializer(habit, context={'request': request})
        current_completions = habit_serializer.data['current']
        total_tasks = habit.tasks.count() or habit.target

        is_fully_completed_now = current_completions >= total_tasks

        if is_fully_completed_now and completed:
             if habit.frequency == 'daily':
                 if habit.last_completed_period_end == today - timedelta(days=1):
                     habit.streak += 1
                 elif habit.last_completed_period_end is None or habit.last_completed_period_end < today - timedelta(days=1):
                     habit.streak = 1
                 habit.last_completed_period_end = today
                 habit.save()

        elif not is_fully_completed_now and not completed:
             if habit.last_completed_period_end == today:
                 habit.last_completed_period_end = None
                 habit.streak = max(0, habit.streak - 1)
                 habit.save()

        # Re-serialize the Habit to include the latest 'current', 'completedToday', and 'streak'
        updated_habit_data = HabitSerializer(habit, context={'request': request}).data

        # Return the full updated habit data
        return Response({
            'status': status_message,
            'habit': updated_habit_data
        }, status=status.HTTP_200_OK)

    # =================================================================
    # --- MISSED HABITS REPORT ACTION (FIXED URL PATH) ---
    # =================================================================

    @action(detail=False, methods=['get'], url_path='missed_habits')
    def missed_habits_report(self, request):
        user_tasks = HabitTask.objects.filter(habit__user=request.user)
        missed_tasks_data = []

        for task in user_tasks:
            habit = task.habit
            frequency = habit.frequency

            prev_start_date, prev_end_date = get_previous_period_range(frequency)

            prev_start_datetime = timezone.make_aware(timezone.datetime.combine(prev_start_date, timezone.datetime.min.time()))
            prev_end_datetime = timezone.make_aware(timezone.datetime.combine(prev_end_date, timezone.datetime.max.time()))

            was_completed_in_prev_period = task.completions.filter(
                completed_at__gte=prev_start_datetime,
                completed_at__lte=prev_end_datetime
            ).exists()

            if not was_completed_in_prev_period:
                missed_tasks_data.append({
                    'habit_id': habit.id,
                    'habit_name': habit.name,
                    'task_id': task.id,
                    'task_name': task.name,
                    'frequency': frequency,
                    'missed_period_end_date': prev_end_date.isoformat(),
                })

        return Response(missed_tasks_data, status=status.HTTP_200_OK)

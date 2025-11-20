from rest_framework import serializers
from .models import Habit, HabitTask, HabitTaskCompletion
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta, date
# FIX 1: Import from .utils to fix circular import
from .utils import get_period_start_date

# --- New: Helper function to determine the start of the current tracking period ---
# NOTE: This should ideally be in a separate utils.py but I'll define it here for context

def get_period_start_date(frequency: str, check_date: date = None) -> date:
    """Calculates the start date of the current (or specified) tracking period."""
    if check_date is None:
        check_date = date.today()

    if frequency == 'daily':
        return check_date
    elif frequency == 'weekly':
        # Start of the week (assuming Monday=0, Sunday=6)
        # Monday is the start of the habit week.
        return check_date - timedelta(days=check_date.weekday())
    elif frequency == 'monthly':
        # Start of the month
        return date(check_date.year, check_date.month, 1)
    return check_date # Default to daily if something is wrong


class HabitTaskCompletionSerializer(serializers.ModelSerializer):
    """Used for nested display of completions if needed, but primarily for logging."""
    completedAt = serializers.DateTimeField(source='completed_at', read_only=True)

    class Meta:
        model = HabitTaskCompletion
        fields = ['id', 'completedAt']
        read_only_fields = fields


class HabitTaskSerializer(serializers.ModelSerializer):
    # ... (content remains the same, uses get_period_start_date) ...
    isCompleted = serializers.SerializerMethodField()

    class Meta:
        model = HabitTask
        fields = ['id', 'name', 'isCompleted']
        read_only_fields = ['id', 'isCompleted']

    def get_isCompleted(self, task: HabitTask) -> bool:
        habit = task.habit
        frequency = habit.frequency

        period_start_date = get_period_start_date(frequency)
        period_start_datetime = timezone.make_aware(timezone.datetime.combine(period_start_date, timezone.datetime.min.time()))

        return task.completions.filter(completed_at__gte=period_start_datetime).exists()


class HabitSerializer(serializers.ModelSerializer):
    tasks = HabitTaskSerializer(many=True, read_only=True)
    current = serializers.SerializerMethodField()
    completedToday = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Habit
        fields = [
            'id', 'name', 'description', 'frequency', 'target',
            'streak', 'category', 'color', 'createdAt',
            'tasks', 'current', 'completedToday',
        ]
        read_only_fields = ['user', 'current', 'streak', 'completedToday', 'createdAt']

    def get_current(self, habit: Habit) -> int:
        """Calculates the number of tasks completed in the current period (FIXED RECURSION)."""

        period_start_date = get_period_start_date(habit.frequency)
        period_start_datetime = timezone.make_aware(timezone.datetime.combine(period_start_date, timezone.datetime.min.time()))

        # FIX 2: Removed recursive call to self.get_completedToday here.
        # Now it simply counts completed tasks for the current period.
        completed_tasks_count = HabitTaskCompletion.objects.filter(
            task__habit=habit,
            completed_at__gte=period_start_datetime
        ).values('task').distinct().count()

        return completed_tasks_count

    def get_completedToday(self, habit: Habit) -> bool:
        """Determines if the entire habit is completed for the current period."""

        current_completions = self.get_current(habit)
        total_tasks = habit.tasks.count()

        # Fallback for single-task habits where target might be 1 (and tasks.count() is 1 after creation)
        if total_tasks == 0:
            total_tasks = habit.target

        # Habit is completed if the number of completed tasks meets the target (which is total task count)
        return current_completions >= total_tasks


class HabitTaskCreationSerializer(serializers.ModelSerializer):
    """Serializer for creating new tasks within a habit."""
    class Meta:
        model = HabitTask
        fields = ['id', 'name', 'habit']
        read_only_fields = ['id', 'habit'] # Habit ID passed in view

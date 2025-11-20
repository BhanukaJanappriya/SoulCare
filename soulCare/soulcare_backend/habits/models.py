from django.db import models
from django.conf import settings
from datetime import date, timedelta
from django.utils import timezone # Important for date/time comparison

# Define choices based on your frontend logic
FREQUENCY_CHOICES = [
    ('daily', 'Daily'),
    ('weekly', 'Weekly'),
    ('monthly', 'Monthly'),
]

CATEGORY_CHOICES = [
    ('Mental Health', 'Mental Health'),
    ('Physical Health', 'Physical Health'),
    ('Nutrition', 'Nutrition'),
    ('Sleep', 'Sleep'),
    ('Social', 'Social'),
    ('Productivity', 'Productivity'),
]

class Habit(models.Model):
    # Foreign Key to the User (Patient) who owns the habit
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='habits',
        limit_choices_to={'role': 'user'}
    )

    # Core Habit fields from the frontend interface
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES, default='daily')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Mental Health')

    # Target: Now represents the number of tasks required, or 1 if no sub-tasks are defined.
    # The actual task targets are now defined by the number of HabitTask objects linked.
    target = models.IntegerField(default=1, help_text="Number of target *tasks* required for full habit completion in a period.")

    # Simple Streak management (still tracked at the Habit level)
    streak = models.IntegerField(default=0, help_text="Current consecutive streak of full habit completion.")

    # UI/Display fields
    color = models.CharField(max_length=50, default='hsl(210, 80%, 50%)', help_text="HSL color string for frontend display.")

    # Tracking/Timestamp fields
    created_at = models.DateTimeField(auto_now_add=True)
    last_completed_period_end = models.DateField(null=True, blank=True, help_text="End date of the last period where the entire habit was completed.")

    # We remove 'current' and 'completed_today' as they are now dynamic properties calculated via HabitTask/HabitTaskCompletion

    class Meta:
        verbose_name = "Habit"
        verbose_name_plural = "Habits"
        unique_together = ('user', 'name')

    def __str__(self):
        return f"{self.user.username}'s Habit: {self.name}"

class HabitTask(models.Model):
    """
    Represents an individual, repeatable task under a main Habit.
    e.g., "Drink water" under the Habit "Morning Routine".
    """
    habit = models.ForeignKey(
        Habit,
        on_delete=models.CASCADE,
        related_name='tasks'
    )
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Habit Task"
        verbose_name_plural = "Habit Tasks"
        unique_together = ('habit', 'name')
        ordering = ['created_at']

    def __str__(self):
        return f"{self.habit.name} - Task: {self.name}"

class HabitTaskCompletion(models.Model):
    """
    Logs the completion of a specific task at a specific time.
    Crucial for period-based tracking and refresh.
    """
    task = models.ForeignKey(
        HabitTask,
        on_delete=models.CASCADE,
        related_name='completions'
    )
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Habit Task Completion"
        verbose_name_plural = "Habit Task Completions"
        # Optional: Indexing for fast period queries
        indexes = [
            models.Index(fields=['task', 'completed_at']),
        ]

    def __str__(self):
        return f"Completed: {self.task.name} at {self.completed_at.strftime('%Y-%m-%d %H:%M')}"

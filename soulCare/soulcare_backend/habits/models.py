# soulcare_backend/habits/models.py

from django.db import models
from django.conf import settings
from datetime import date

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
    # settings.AUTH_USER_MODEL ensures it links to 'authapp.User'
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='habits',
        limit_choices_to={'role': 'user'} # Optional: Limit to patients (role='user')
    )

    # Core Habit fields from the frontend interface
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES, default='daily')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Mental Health')

    # Target and Progress fields
    target = models.IntegerField(default=1, help_text="Target occurrences per frequency period.")
    current = models.IntegerField(default=0, help_text="Current count for the current period (e.g., this day/week).")
    streak = models.IntegerField(default=0, help_text="Current consecutive streak.")

    # UI/Display fields
    color = models.CharField(max_length=50, default='hsl(210, 80%, 50%)', help_text="HSL color string for frontend display.")

    # Tracking/Timestamp fields
    created_at = models.DateTimeField(auto_now_add=True)
    last_completed = models.DateField(null=True, blank=True)

    # Logic field to mirror completedToday state
    # This field will be updated by an API call from the frontend
    completed_today = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Habit"
        verbose_name_plural = "Habits"
        # Optional: Prevent a user from having two habits with the same name
        unique_together = ('user', 'name')

    def __str__(self):
        return f"{self.user.username}'s Habit: {self.name}"

    def save(self, *args, **kwargs):
        # Simple logic to reset 'current' or 'streak' if a day has passed
        # More complex logic belongs in a dedicated service or periodic task
        if self.last_completed and self.last_completed < date.today():
             # Example: If a day passed and it was a daily habit, you might reset current/streak.
             # For simplicity now, we rely on frontend logic/API to manage this via the views.
             pass
        super().save(*args, **kwargs)

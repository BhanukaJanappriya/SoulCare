# In soulcare_backend/moodtracker/models.py

from django.db import models
from django.conf import settings # Best practice to import the User model from settings
from django.core.validators import MinValueValidator, MaxValueValidator

class Activity(models.Model):
    """Represents a selectable activity that can be linked to a mood entry."""
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class MoodEntry(models.Model):
    """Represents a single mood log from a patient."""
    patient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='mood_entries')

    # The core metrics
    mood = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    energy = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    anxiety = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])

    # Optional notes
    notes = models.TextField(blank=True, null=True)

    # Many-to-many relationship for activities
    activities = models.ManyToManyField(Activity, blank=True)

    # Timestamps
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date'] # Show the most recent entries first by default
        unique_together = ('patient', 'date') # A user can only have one entry per day

    def __str__(self):
        return f"Mood entry for {self.patient.username} on {self.date}"

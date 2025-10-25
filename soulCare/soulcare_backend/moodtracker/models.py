# In soulcare_backend/moodtracker/models.py

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

class Activity(models.Model):
    name = models.CharField(max_length=100, unique=True)
    def __str__(self): return self.name

# NEW: Model for descriptive tags
class Tag(models.Model):
    name = models.CharField(max_length=100, unique=True)
    def __str__(self): return self.name

class MoodEntry(models.Model):
    patient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    mood = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    energy = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    anxiety = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    notes = models.TextField(blank=True, null=True)
    activities = models.ManyToManyField(Activity, blank=True)

    # NEW: Many-to-many relationship for tags
    tags = models.ManyToManyField(Tag, blank=True)

    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('patient', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"Mood entry for {self.patient.username} on {self.date}"

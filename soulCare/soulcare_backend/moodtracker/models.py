# In soulcare_backend/mood/models.py

from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Activity(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Activities"

class MoodEntry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mood_entries')
    date = models.DateField()
    mood = models.IntegerField(help_text="Mood level from 1-10")
    energy = models.IntegerField(help_text="Energy level from 1-10")
    anxiety = models.IntegerField(help_text="Anxiety level from 1-10")
    notes = models.TextField(blank=True, null=True)
    activities = models.ManyToManyField(Activity, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'date']
        verbose_name_plural = "Mood Entries"
        ordering = ['-date']

    def __str__(self):
        return f"{self.user.username} - {self.date} - Mood: {self.mood}"

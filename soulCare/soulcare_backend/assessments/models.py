# soulcare_backend/assessments/models.py

from django.db import models
from django.conf import settings
from datetime import date
from django.utils.translation import gettext_lazy as _

# Define the score ranges based on the required output
DEPRESSION_LEVELS = (
    (1, _('Not depressed (0-18)')),
    (2, _('Few signs of depression (19-36)')),
    (3, _('Possible signs of depression (37-63)')),
    (4, _('Some signs of clinical depression (64-81)')),
    (5, _('Generally depressed (82-100)')),
)

class Questionnaire(models.Model):
    """Represents a specific assessment, like the Depression Test."""
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    max_raw_score = models.IntegerField(default=80)  # 20 questions * max score 4
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']


class Question(models.Model):
    """Individual questions belonging to a questionnaire."""
    questionnaire = models.ForeignKey(
        Questionnaire,
        related_name='questions',
        on_delete=models.CASCADE
    )
    text = models.TextField()
    order = models.IntegerField()
    # Scoring is fixed: 0, 1, 2, 3, 4 (No need for a separate AnswerOption model)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.order}. {self.text[:50]}..."


class AssessmentResult(models.Model):
    """Stores a patient's submission and calculated result."""
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'user'}
    )
    questionnaire = models.ForeignKey(Questionnaire, on_delete=models.PROTECT)
    raw_score = models.IntegerField()        # Max 80
    scaled_score = models.IntegerField()     # Max 100
    level = models.IntegerField(choices=DEPRESSION_LEVELS)
    interpretation = models.TextField()      # The description for the level
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient.username}'s {self.questionnaire.title} Result: {self.scaled_score}/100"

    class Meta:
        ordering = ['-submitted_at']

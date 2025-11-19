from django.db import models
from django.conf import settings

class ReactionTimeResult(models.Model):
    # --- Core Game Result ---
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reaction_time_results',
        help_text="The user who performed the test."
    )
    reaction_time_ms = models.IntegerField(
        help_text="The calculated reaction time in milliseconds."
    )

    # --- Mood and Matrix Data ---
    MOOD_CHOICES = [
        (1, 'Very Stressed'),
        (2, 'Stressed'),
        (3, 'Neutral'),
        (4, 'Calm'),
        (5, 'Very Calm'),
    ]
    post_game_mood = models.IntegerField(
        choices=MOOD_CHOICES,
        default=3,
        help_text="User's reported mood after completing the game (1-5 scale)."
    )

    # ADD null=True, blank=True to make these fields optional or allow them to be saved as NULL
    perceived_effort = models.IntegerField(
        null=True, blank=True,
        help_text="How much effort did you feel you exerted? (1=None, 10=Max)"
    )

    # ADD null=True, blank=True
    stress_reduction_rating = models.IntegerField(
        null=True, blank=True,
        help_text="Do you feel calmer after the game? (1=No, 10=Definitely Yes)"
    )

    # --- Standard Metadata ---
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp of when the result was recorded."
    )

class MemoryGameResult(models.Model):
    # --- Core Game Result ---
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='memory_game_results',
        help_text="The user who performed the test."
    )
    # The score will be the highest successful sequence length
    max_sequence_length = models.IntegerField(
        help_text="The highest level/length of the sequence successfully matched."
    )
    total_attempts = models.IntegerField(
        help_text="The number of attempts made before failing."
    )

    # --- Mood and Matrix Data (Same matrix questions for consistency) ---
    MOOD_CHOICES = ReactionTimeResult.MOOD_CHOICES # Re-use the mood choices

    post_game_mood = models.IntegerField(
        choices=MOOD_CHOICES,
        default=3,
        help_text="User's reported mood after completing the game (1-5 scale)."
    )

    perceived_effort = models.IntegerField(
        null=True, blank=True, # Allow null/optional based on our previous fix
        help_text="How much effort did you feel you exerted? (1=None, 10=Max)"
    )

    stress_reduction_rating = models.IntegerField(
        null=True, blank=True, # Allow null/optional based on our previous fix
        help_text="Do you feel calmer after the game? (1=No, 10=Definitely Yes)"
    )

    # --- Standard Metadata ---
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp of when the result was recorded."
    )

    def __str__(self):
        return f"{self.user.username}'s Memory Score: {self.max_sequence_length}"

    class Meta:
        verbose_name = "Memory Game Result"
        ordering = ['-created_at']

class StroopGameResult(models.Model):
    # --- Core Game Result ---
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='stroop_game_results',
        help_text="The user who performed the test."
    )

    total_correct = models.IntegerField(
        help_text="The total number of correct answers (out of N trials)."
    )
    interference_score_ms = models.IntegerField(
        help_text="The difference in average time between incongruent and congruent trials (ms)."
    )
    total_time_s = models.FloatField( # Use FloatField for precision
        help_text="The total time taken to complete all trials (seconds)."
    )

    # --- Mood and Matrix Data (Same matrix questions) ---
    MOOD_CHOICES = ReactionTimeResult.MOOD_CHOICES # Re-use the mood choices

    post_game_mood = models.IntegerField(
        choices=MOOD_CHOICES,
        default=3,
        help_text="User's reported mood after completing the game (1-5 scale)."
    )

    perceived_effort = models.IntegerField(
        null=True, blank=True,
        help_text="How much effort did you feel you exerted? (1=None, 10=Max)"
    )

    stress_reduction_rating = models.IntegerField(
        null=True, blank=True,
        help_text="Do you feel calmer after the game? (1=No, 10=Definitely Yes)"
    )

    # --- Standard Metadata ---
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp of when the result was recorded."
    )

    def __str__(self):
        return f"{self.user.username}'s Stroop Score: {self.total_correct}"

    class Meta:
        verbose_name = "Stroop Game Result"
        ordering = ['-created_at']

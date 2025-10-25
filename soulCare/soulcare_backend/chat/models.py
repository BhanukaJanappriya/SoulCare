# soulcare_backend/chat/models.py
from django.db import models
from django.conf import settings

class Conversation(models.Model):
    """
    A conversation between two users.
    We use patient and provider fields to enforce the 1-on-1 logic.
    """
    # Ensure 'user' (patient) and 'provider' roles are enforced
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="patient_conversations",
        limit_choices_to={'role': 'user'}
    )
    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="provider_conversations",
        limit_choices_to=models.Q(role='doctor') | models.Q(role='counselor')
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Ensures a patient-provider pair can only have one conversation
        unique_together = ('patient', 'provider')

    def __str__(self):
        return f"Conversation between {self.patient.username} and {self.provider.username}"


class Message(models.Model):
    """
    A single message within a conversation.
    """
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="messages"
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_messages"
    )
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp'] # Show oldest messages first

    def __str__(self):
        return f"Message from {self.sender.username} at {self.timestamp.strftime('%Y-%m-%d %H:%M')}"
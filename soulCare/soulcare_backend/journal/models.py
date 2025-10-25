# journal/models.py

from django.db import models
from authapp.models import PatientProfile, CounselorProfile

class Tag(models.Model):
    """Represents a tag that can be associated with a journal entry, e.g., 'gratitude', 'work'."""
    name = models.CharField(max_length=50, unique=True, help_text="The name of the tag.")

    def __str__(self):
        return self.name

class JournalEntry(models.Model):
    """Represents a single journal entry made by a patient."""
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='journal_entries')
    title = models.CharField(max_length=255)
    content = models.TextField()
    mood_emoji = models.CharField(max_length=10, blank=True, null=True, help_text="An emoji representing the mood of the entry.")
    tags = models.ManyToManyField(Tag, related_name='journal_entries', blank=True)
    is_private = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    shared_with_counselor = models.ForeignKey(
        CounselorProfile,
        on_delete=models.SET_NULL, # If counselor is deleted, don't delete the journal
        null=True,
        blank=True,
        related_name='shared_journal_entries'
    )

    class Meta:
        ordering = ['-created_at'] # Show the newest entries first

    def __str__(self):
        return f"'{self.title}' by {self.patient.user.username} on {self.created_at.strftime('%Y-%m-%d')}"

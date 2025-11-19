# soulcare_backend/content/models.py

from django.db import models
from django.conf import settings
from django.db.models import Q

class ContentItem(models.Model):
    """
    Represents a piece of shareable content (video, audio, PDF, etc.)
    uploaded by a provider.
    """
    CONTENT_TYPES = [
        ('video', 'Video'),
        ('audio', 'Audio'),
        ('document', 'Document'),
        ('image', 'Image'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    type = models.CharField(max_length=20, choices=CONTENT_TYPES)
    
    # This handles the file upload.
    # Files will be saved to your 'MEDIA_ROOT/content_files/' directory
    file = models.FileField(upload_to='content_files/')
    
    # The provider who uploaded this item
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="content_items",
        limit_choices_to=Q(role='doctor') | Q(role='counselor')
    )
    
    # The list of patients this item is shared with
    shared_with = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="shared_content",
        blank=True,
        limit_choices_to={'role': 'user'}
    )
    
    tags = models.CharField(max_length=255, blank=True, help_text="Comma-separated tags")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.type}) by {self.owner.username}"

    class Meta:
        ordering = ['-created_at']
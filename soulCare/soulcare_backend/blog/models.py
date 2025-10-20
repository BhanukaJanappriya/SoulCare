from django.db import models
from django.contrib.auth.models import User

# Mood choices for the radio bar
MOOD_CHOICES = [
    ('happy', '😊 Happy'),
    ('calm', '😌 Calm'),
    ('neutral', '😐 Neutral'),
    ('anxious', '😟 Anxious'),
    ('sad', '😔 Sad'),
]

class BlogPost(models.Model):
    """
    Model for a blog post in the mental healthcare system.
    """
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blog_posts')
    title = models.CharField(max_length=200)
    description = models.TextField()  # Renamed from 'content' to 'description'
    content = models.TextField()  # A more detailed field for the main body
    tags = models.CharField(max_length=255, help_text="Comma-separated tags")
    mood = models.CharField(max_length=10, choices=MOOD_CHOICES, default='neutral')
    status = models.CharField(
        max_length=10,
        choices=[
            ('draft', 'Draft'),
            ('pending', 'Pending Review'),
            ('published', 'Published'),
            ('rejected', 'Rejected'),
        ],
        default='draft'
    )
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']
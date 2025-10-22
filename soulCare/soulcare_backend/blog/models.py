# blog/models.py
from django.db import models
from authapp.models import User


class BlogPost(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending', 'Pending Review'),
        ('published', 'Published'),
        ('rejected', 'Rejected'),
    ]

    # Use the User model from your authapp
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blog_posts')
    title = models.CharField(max_length=255)

    # This stores the potentially rich-text content
    content = models.TextField()

    excerpt = models.TextField(blank=True)
    tags = models.CharField(max_length=500, blank=True, help_text="Comma separated tags")

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='draft'
    )

    # Dates
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    publishedAt = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-createdAt']
        verbose_name = "Blog Post"
        verbose_name_plural = "Blog Posts"

    def __str__(self):
        return self.title

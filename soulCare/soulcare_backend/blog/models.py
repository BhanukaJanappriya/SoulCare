
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

# Use get_user_model for best practice, or keep your direct import if preferred
from django.contrib.auth import get_user_model
User = get_user_model()

class BlogPost(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending', 'Pending Review'),
        ('published', 'Published'),
        ('rejected', 'Rejected'),
    ]

    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='blog_posts')
    title = models.CharField(max_length=255)
    content = models.TextField()
    excerpt = models.TextField(blank=True)
    tags = models.CharField(max_length=500, blank=True, help_text="Comma separated tags")

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='draft'
    )

    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    publishedAt = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-createdAt']
        verbose_name = "Blog Post"
        verbose_name_plural = "Blog Posts"

    def __str__(self):
        return self.title


class BlogComment(models.Model):
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, related_name='blog_comments', null=True, blank=True)
    content = models.TextField()
    
    # Guest fields
    guest_name = models.CharField(max_length=100, blank=True, null=True)
    guest_email = models.EmailField(blank=True, null=True)
    
    createdAt = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-createdAt'] # Newest comments first usually
        verbose_name = "Blog Comment"
        verbose_name_plural = "Blog Comments"

    def __str__(self):
        name = self.author.username if self.author else (self.guest_name or 'Guest')
        return f"Comment by {name} on {self.post.title}"


class BlogRating(models.Model):
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='ratings')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='blog_ratings', null=True, blank=True)
    value = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    createdAt = models.DateTimeField(auto_now_add=True)
    session_key = models.CharField(max_length=40, blank=True, null=True)

    class Meta:
        unique_together = ('post', 'user') # Prevent double rating by same user

class BlogReaction(models.Model):
    REACTION_CHOICES = [
        ('like', 'Like'),
        ('heart', 'Heart'), # Changed from 'love' to match Frontend Icon name usually
        ('insightful', 'Insightful'),
    ]
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='blog_reactions', null=True, blank=True)
    
    # We use reaction_type internally, but frontend sends 'type'
    reaction_type = models.CharField(max_length=20, choices=REACTION_CHOICES, default='like')
    session_key = models.CharField(max_length=40, blank=True, null=True)

    class Meta:
         unique_together = ('post', 'user') # Prevent double reaction

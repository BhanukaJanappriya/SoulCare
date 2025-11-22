from django.db import models
from django.conf import settings
from authapp.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class BlogPost(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending', 'Pending Review'),
        ('published', 'Published'),
        ('rejected', 'Rejected'),
    ]

    # Use the User model from your authapp
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='blog_posts')
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

# --- NEW MODELS FOR ENGAGEMENT ---

class BlogComment(models.Model):
    """Allows any user (including anonymous) to comment on a blog post."""
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='comments')
    # MODIFIED: Allow null=True, blank=True for anonymous comments
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, related_name='blog_comments', null=True, blank=True)
    content = models.TextField()
    # NEW: Store name/email for anonymous users
    guest_name = models.CharField(max_length=100, blank=True, null=True)
    guest_email = models.EmailField(blank=True, null=True)
    createdAt = models.DateTimeField(auto_now_add=True)


    class Meta:
        ordering = ['createdAt']
        verbose_name = "Blog Comment"
        verbose_name_plural = "Blog Comments"

    def __str__(self):
        # NOTE: You need to update this __str__ method to handle the null author!
        author_display = self.author.username if self.author else self.guest_name or 'Guest'
        return f"Comment by {author_display} on {self.post.title[:20]}..."


class BlogRating(models.Model):
    """Allows a user to rate a blog post (1-5 stars)."""
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='ratings')
    # MODIFIED: Allow null=True, blank=True
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='blog_ratings', null=True, blank=True)
    value = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating value from 1 to 5."
    )
    createdAt = models.DateTimeField(auto_now_add=True)

    # NEW: Store IP/Session for anonymous rating identification (prevents spamming)
    session_key = models.CharField(max_length=40, blank=True, null=True)

    class Meta:
        # We remove unique_together to allow for NULL users.
        pass

class BlogReaction(models.Model):
    """Allows a user to add a 'Like' or other simple reaction."""
    REACTION_CHOICES = [
        ('like', 'Like'),
        ('love', 'Love'),
        ('insightful', 'Insightful'),
    ]
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='reactions')
    # MODIFIED: Allow null=True, blank=True
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='blog_reactions', null=True, blank=True)

    # CRITICAL FIX: Renamed 'type' to 'reaction_type' to resolve FieldError
    reaction_type = models.CharField(max_length=20, choices=REACTION_CHOICES, default='like')

    # NEW: Store IP/Session for anonymous identification
    session_key = models.CharField(max_length=40, blank=True, null=True)

    class Meta:
        # We remove unique_together to allow for NULL users.
        pass

# blogs/models.py
from django.db import models
from authapp.models import User
import uuid

class BlogPost(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending', 'Pending Review'),
        ('published', 'Published'),
        ('rejected', 'Rejected'),
    ]
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blog_posts')
    title = models.CharField(max_length=255)
    content = models.TextField()
    excerpt = models.TextField(blank=True, null=True)
    tags = models.JSONField(default=list, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    publishedAt = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-createdAt']
        verbose_name = "Blog Post"
        verbose_name_plural = "Blog Posts"
    def __str__(self):
        return self.title

class BlogRating(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='ratings')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blog_ratings')
    rating = models.PositiveSmallIntegerField()
    class Meta:
        unique_together = ('post', 'user')
    def __str__(self):
        return f'{self.user.username} rated "{self.post.title}" with {self.rating} stars'






# # blog/models.py
# from django.db import models
# from authapp.models import User


# class BlogPost(models.Model):
#     STATUS_CHOICES = [
#         ('draft', 'Draft'),
#         ('pending', 'Pending Review'),
#         ('published', 'Published'),
#         ('rejected', 'Rejected'),
#     ]

#     # Use the User model from your authapp
#     author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blog_posts')
#     title = models.CharField(max_length=255)

#     # This stores the potentially rich-text content
#     content = models.TextField()

#     excerpt = models.TextField(blank=True)
#     tags = models.CharField(max_length=500, blank=True, help_text="Comma separated tags")

#     status = models.CharField(
#         max_length=10,
#         choices=STATUS_CHOICES,
#         default='draft'
#     )

#     # Dates
#     createdAt = models.DateTimeField(auto_now_add=True)
#     updatedAt = models.DateTimeField(auto_now=True)
#     publishedAt = models.DateTimeField(null=True, blank=True)

#     class Meta:
#         ordering = ['-createdAt']
#         verbose_name = "Blog Post"
#         verbose_name_plural = "Blog Posts"

#     def __str__(self):
#         return self.title

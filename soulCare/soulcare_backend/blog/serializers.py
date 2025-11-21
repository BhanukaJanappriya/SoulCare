
from rest_framework import serializers
from django.db.models import Avg
from .models import BlogPost, BlogRating
from authapp.models import User

class BlogRatingSerializer(serializers.ModelSerializer):
    """Used only for creating or updating a rating."""
    class Meta:
        model = BlogRating
        fields = ['rating']
        extra_kwargs = { 'rating': {'min_value': 1, 'max_value': 5} }

class BlogPostSerializer(serializers.ModelSerializer):
    authorId = serializers.UUIDField(source='author.id', read_only=True)
    author_name = serializers.CharField(source='author.username', read_only=True)
    author_role = serializers.CharField(source='author.role', read_only=True)
    
    # Add the new rating fields
    averageRating = serializers.SerializerMethodField()
    ratingCount = serializers.SerializerMethodField()
    userRating = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            'id', 'authorId', 'author_name', 'author_role', 'title', 'content', 
            'excerpt', 'tags', 'status', 'publishedAt', 'createdAt', 'updatedAt',
            'averageRating', 'ratingCount', 'userRating'
        ]
        # Make tags writable so we can create/update them
        read_only_fields = ['createdAt', 'updatedAt', 'publishedAt', 'authorId', 'author_name', 'author_role']

    def get_averageRating(self, obj):
        avg = obj.ratings.aggregate(Avg('rating')).get('rating__avg')
        return round(avg, 1) if avg else 0.0

    def get_ratingCount(self, obj):
        return obj.ratings.count()

    def get_userRating(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            try:
                return BlogRating.objects.get(post=obj, user=user).rating
            except BlogRating.DoesNotExist:
                return 0
        return 0

    def to_internal_value(self, data):
        # Convert comma-separated string from frontend 'tags' input to a list
        tags_input = data.get('tags')
        if isinstance(tags_input, str):
            data['tags'] = [tag.strip() for tag in tags_input.split(',') if tag.strip()]
        return super().to_internal_value(data)

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)

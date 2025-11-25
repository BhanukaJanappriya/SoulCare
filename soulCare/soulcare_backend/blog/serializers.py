from rest_framework import serializers
from .models import BlogPost, BlogComment, BlogRating, BlogReaction
from django.contrib.auth import get_user_model
from django.db.models import Avg

User = get_user_model()

class BlogCommentSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    authorAvatar = serializers.SerializerMethodField()

    class Meta:
        model = BlogComment
        fields = ['id', 'post', 'author', 'content', 'authorAvatar', 'createdAt', 'guest_name', 'guest_email']
        read_only_fields = ['id', 'post', 'author', 'createdAt']

    def get_author(self, obj):
        if not obj.author:
            return obj.guest_name or "Guest"
        return obj.author.first_name + " " + obj.author.last_name if obj.author.first_name else obj.author.username

    def get_authorAvatar(self, obj):
        return "" 


class BlogPostSerializer(serializers.ModelSerializer):
    authorId = serializers.PrimaryKeyRelatedField(source='author', read_only=True)
    
    # --- CAMELCASE FIX FOR FRONTEND ---
    averageRating = serializers.SerializerMethodField()
    ratingCount = serializers.SerializerMethodField()
    commentCount = serializers.SerializerMethodField()
    
    # User specific fields
    userRating = serializers.SerializerMethodField()
    userReaction = serializers.SerializerMethodField()
    
    # Reaction counters
    likeCount = serializers.SerializerMethodField()
    heartCount = serializers.SerializerMethodField()
    insightfulCount = serializers.SerializerMethodField()

    # Allow writing tags as a simple string
    tags = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = BlogPost
        fields = [
            'id', 'authorId', 'title', 'content', 'excerpt', 'tags',
            'status', 'publishedAt', 'createdAt', 'updatedAt',
            # Updated to camelCase
            'averageRating', 'ratingCount', 'commentCount',
            'userRating', 'userReaction',
            'likeCount', 'heartCount', 'insightfulCount'
        ]
        read_only_fields = ['createdAt', 'updatedAt', 'publishedAt']

    # Convert tags string "A, B" -> list ["A", "B"] for frontend
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if instance.tags:
            ret['tags'] = [t.strip() for t in instance.tags.split(',') if t.strip()]
        else:
            ret['tags'] = []
        return ret

    # --- Match method names to camelCase fields ---
    def get_averageRating(self, obj):
        avg = obj.ratings.aggregate(Avg('value'))['value__avg']
        return round(avg, 1) if avg else 0.0

    def get_ratingCount(self, obj):
        return obj.ratings.count()

    def get_commentCount(self, obj):
        return obj.comments.count()

    def get_userRating(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            try:
                rating = obj.ratings.get(user=user)
                return rating.value
            except BlogRating.DoesNotExist:
                return 0
        return 0

    def get_userReaction(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            try:
                reaction = obj.reactions.get(user=user)
                return reaction.reaction_type
            except BlogReaction.DoesNotExist:
                return None
        return None

    def get_likeCount(self, obj):
        return obj.reactions.filter(reaction_type='like').count()
    
    def get_heartCount(self, obj):
        return obj.reactions.filter(reaction_type='heart').count()

    def get_insightfulCount(self, obj):
        return obj.reactions.filter(reaction_type='insightful').count()
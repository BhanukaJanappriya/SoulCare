# # blog/serializers.py

# from rest_framework import serializers
# # --- START: NEW IMPORTS ---
# from django.db.models import Avg
# from .models import BlogPost, BlogRating
# # --- END: NEW IMPORTS ---
# from authapp.models import User

# # --- START: NEW SERIALIZER FOR SUBMITTING A RATING ---
# class BlogRatingSerializer(serializers.ModelSerializer):
#     """Used only for creating or updating a rating."""
#     class Meta:
#         model = BlogRating
#         fields = ['rating']
#         # Add validation to ensure rating is between 1 and 5
#         extra_kwargs = {
#             'rating': {'min_value': 1, 'max_value': 5}
#         }
# # --- END: NEW SERIALIZER ---

# class BlogPostSerializer(serializers.ModelSerializer):
#     # Use source to get the id field from the author object
#     authorId = serializers.UUIDField(source='author.id', read_only=True)
#     author_name = serializers.CharField(source='author.username', read_only=True)
#     author_role = serializers.CharField(source='author.role', read_only=True)
    
#     # --- START: NEW FIELDS FOR RATINGS ---
#     averageRating = serializers.SerializerMethodField()
#     ratingCount = serializers.SerializerMethodField()
#     userRating = serializers.SerializerMethodField()
#     # --- END: NEW FIELDS ---

#     class Meta:
#         model = BlogPost
#         fields = [
#             'id', 'authorId', 'author_name', 'author_role', 'title', 'content', 
#             'excerpt', 'tags', 'status', 'publishedAt', 'createdAt', 'updatedAt',
#             # Add the new rating fields to the final JSON output
#             'averageRating', 'ratingCount', 'userRating'
#         ]
#         read_only_fields = [
#             'createdAt', 'updatedAt', 'publishedAt', 'authorId', 
#             'author_name', 'author_role'
#         ]

#     # This function calculates the average rating for a post
#     def get_averageRating(self, obj):
#         # Use Django's aggregation for an efficient database query
#         avg = obj.ratings.aggregate(Avg('rating')).get('rating__avg')
#         return round(avg, 1) if avg else 0.0

#     # This function counts how many ratings a post has
#     def get_ratingCount(self, obj):
#         return obj.ratings.count()

#     # This function checks if the current logged-in user has rated this specific post
#     def get_userRating(self, obj):
#         user = self.context['request'].user
#         if user.is_authenticated:
#             try:
#                 # Find the specific rating by this user for this post
#                 return BlogRating.objects.get(post=obj, user=user).rating
#             except BlogRating.DoesNotExist:
#                 return 0 # User has not rated this post, so their rating is 0
#         return 0 # User is not logged in

#     def create(self, validated_data):
#         # Set author from the request context, which is provided by the view
#         validated_data['author'] = self.context['request'].user
#         return super().create(validated_data)










# blogs/serializers.py

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

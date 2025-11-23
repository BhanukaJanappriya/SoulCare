from rest_framework import serializers
from .models import BlogPost, BlogComment, BlogRating, BlogReaction
from authapp.models import User
from django.db.models import Avg, Count

# Serializer for the Author's basic info (Keep as is)
class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email']


# --- NEW COMMENT SERIALIZER ---
class BlogCommentSerializer(serializers.ModelSerializer):
    # Use BasicUserInfo structure from frontend type definitions
    author = serializers.SerializerMethodField()

    class Meta:
        model = BlogComment
        # Include guest fields for anonymous comments
        fields = ['id', 'post', 'author', 'content', 'createdAt', 'guest_name', 'guest_email']
        read_only_fields = ['id', 'post', 'author', 'createdAt']
        extra_kwargs = {
            # Make guest fields required only if author is not provided (handled in view/validation)
            'guest_name': {'required': False},
            'guest_email': {'required': False},
        }


    def get_author(self, obj):
        # Handle case where author is NULL (Guest)
        if not obj.author:
            return {
                # Return the guest details for the frontend to display
                'id': None,
                'username': None,
                'role': 'guest',
                'full_name': obj.guest_name or 'Guest',
                'guestName': obj.guest_name,
                'guestEmail': obj.guest_email,
            }

        # Logic for authenticated users (remains the same)
        author = obj.author
        full_name = None

        try:
            if author.role == 'doctor' and hasattr(author, 'doctorprofile'):
                full_name = author.doctorprofile.full_name
            elif author.role == 'counselor' and hasattr(author, 'counselorprofile'):
                full_name = author.counselorprofile.full_name
            elif author.role == 'user' and hasattr(author, 'patientprofile'):
                full_name = author.patientprofile.full_name
        except Exception:
            pass

        return {
            'id': author.id,
            'username': author.username,
            'email': author.email,
            'role': author.role,
            'full_name': full_name or author.username,
        }
# --- END NEW COMMENT SERIALIZER ---


class BlogPostSerializer(serializers.ModelSerializer):
    authorId = serializers.PrimaryKeyRelatedField(
        source='author',
        read_only=True
    )

    # Aggregated fields (Read Only)
    average_rating = serializers.SerializerMethodField()
    rating_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    reaction_counts = serializers.SerializerMethodField() # e.g., {'like': 10, 'love': 5}

    author_name = serializers.SerializerMethodField()
    author_role = serializers.SerializerMethodField()

    tags = serializers.SerializerMethodField()
    tags_input = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = BlogPost
        fields = [
            'id', 'authorId', 'title', 'content', 'excerpt', 'tags',
            'status', 'publishedAt', 'createdAt', 'updatedAt', 'tags_input',
            'author_name', 'author_role', 'average_rating', 'rating_count',
            'comment_count', 'reaction_counts'
        ]
        read_only_fields = ['createdAt', 'updatedAt']

    # --- AGGREGATION METHODS ---

    def get_average_rating(self, obj):
        # Calculate the average rating from all associated BlogRating objects
        avg = obj.ratings.aggregate(Avg('value'))['value__avg']
        return round(avg, 2) if avg is not None else 0.0

    def get_rating_count(self, obj):
        # Count the total number of ratings
        return obj.ratings.count()

    def get_comment_count(self, obj):
        # Count the total number of comments
        return obj.comments.count()

    def get_reaction_counts(self, obj):
        # Count the total number of each reaction type (like, love, etc.)
        # CRITICAL FIX: Changed 'type' to 'reaction_type'
        counts = obj.reactions.values('reaction_type').annotate(count=Count('reaction_type'))

        # Format as a dictionary: {'like': 5, 'love': 2, ...}
        # Include all possible types to avoid missing keys on the frontend
        result = {
            'like': 0,
            'love': 0,
            'insightful': 0
        }
        for item in counts:
            # CRITICAL FIX: Changed item['type'] to item['reaction_type']
            result[item['reaction_type']] = item['count']

        return result

    # --- OTHER METHODS (Keep as is) ---
    def get_tags(self, obj):
        if obj.tags:
            return [tag.strip() for tag in obj.tags.split(',') if tag.strip()]
        return []

    def get_author_name(self, obj):
        # Logic is complex due to profile lookups; sticking to the provided logic
        try:
             if obj.author: # Ensure author exists before accessing attributes
                 if obj.author.role == 'doctor' and hasattr(obj.author, 'doctorprofile'):
                     return obj.author.doctorprofile.full_name or obj.author.username
                 # ... other role logic ...
        except Exception:
             pass

        return obj.author.username if obj.author else 'Unknown Author'


    def get_author_role(self, obj):
        return obj.author.role if obj.author else 'unknown'


    # Method to handle incoming data during create/update (Keep as is)
    def validate(self, data):
        if 'tags_input' in data:
            data['tags'] = data.pop('tags_input')

        if 'status' in data and data['status'] == 'published':
            from django.utils import timezone
            if not self.instance or not self.instance.publishedAt:
                 data['publishedAt'] = timezone.now()

        return data

from rest_framework import serializers
from .models import BlogPost
from authapp.models import User

# Serializer for the Author's basic info
class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email']

class BlogPostSerializer(serializers.ModelSerializer):
    # Rename 'author' (Django field) to 'authorId' (Frontend expectation)
    # This field will return the ID of the author
    authorId = serializers.PrimaryKeyRelatedField(
        source='author',
        read_only=True
    )
    
    author_name = serializers.SerializerMethodField()
    author_role = serializers.SerializerMethodField()
    
    tags = serializers.SerializerMethodField()

    # Override the default to allow writing (creating/updating) the tags field
    tags_input = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = BlogPost
        # The fields list must match the keys in your mock JSON data
        fields = [
            'id', 'authorId', 'title', 'content', 'excerpt', 'tags',
            'status', 'publishedAt', 'createdAt', 'updatedAt', 'tags_input', 'author_name', 'author_role'
        ]
        # Make createdAt and updatedAt read-only as Django handles them
        read_only_fields = ['createdAt', 'updatedAt']

    # Method to convert the comma-separated string from the model into a list/array for JSON
    def get_tags(self, obj):
        if obj.tags:
            # Split the string by comma, strip whitespace, and filter out empty strings
            return [tag.strip() for tag in obj.tags.split(',') if tag.strip()]
        return [] # Return an empty array if tags are blank
    
    def get_author_name(self, obj):
        # Try to get the full name from the profile, fallback to username
        # This logic needs to be robust to handle users without profiles
        try:
            if obj.author.role == 'doctor' and hasattr(obj.author, 'doctorprofile'):
                return obj.author.doctorprofile.username
            elif obj.author.role == 'counselor' and hasattr(obj.author, 'counselorprofile'):
                return obj.author.counselorprofile.username
            elif obj.author.role == 'user' and hasattr(obj.author, 'patientprofile'):
                return obj.author.patientprofile.username
        except Exception:
            pass
            
        return obj.author.username
    
    def get_author_role(self, obj):
        return obj.author.role
    

    # Method to handle incoming data during create/update
    def validate(self, data):
        # Convert the list of tags from the frontend back to a comma-separated string for the model
        if 'tags_input' in data:
            data['tags'] = data.pop('tags_input')

        # Logic to set publishedAt
        if 'status' in data and data['status'] == 'published':
            from django.utils import timezone
            # Only set publishedAt if it's not already set
            if not self.instance or not self.instance.publishedAt:
                 data['publishedAt'] = timezone.now()

        return data
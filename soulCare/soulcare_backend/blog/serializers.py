# blog/serializers.py

from rest_framework import serializers
from .models import BlogPost
from authapp.models import User

# Serializer for the Author's basic info
class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email']
        # You would typically add a first_name/last_name field to your User model

class BlogPostSerializer(serializers.ModelSerializer):
    # Rename 'author' (Django field) to 'authorId' (Frontend expectation)
    # This field will return the ID of the author
    authorId = serializers.PrimaryKeyRelatedField(
        source='author',
        read_only=True
    )
    # Optional: If you want to include the author's full name, uncomment and adjust:
    # author_name = serializers.CharField(source='author.get_full_name', read_only=True)

    # tags is stored as a string in the Model, but your frontend uses an array (string[])
    # We override the field to handle the conversion
    tags = serializers.SerializerMethodField()

    # Override the default to allow writing (creating/updating) the tags field
    tags_input = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = BlogPost
        # The fields list must match the keys in your mock JSON data
        fields = [
            'id', 'authorId', 'title', 'content', 'excerpt', 'tags',
            'status', 'publishedAt', 'createdAt', 'updatedAt', 'tags_input'
        ]
        # Make createdAt and updatedAt read-only as Django handles them
        read_only_fields = ['createdAt', 'updatedAt']

    # Method to convert the comma-separated string from the model into a list/array for JSON
    def get_tags(self, obj):
        return [tag.strip() for tag in obj.tags.split(',') if tag.strip()]

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

    def create(self, validated_data):
        # We need to manually add the author, typically from the request user
        # For now, we'll assign to the first User in the database
        try:
            validated_data['author'] = User.objects.first()
        except User.DoesNotExist:
             raise serializers.ValidationError("No users found to assign as author.")

        return BlogPost.objects.create(**validated_data)

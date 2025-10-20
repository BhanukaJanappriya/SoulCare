from rest_framework import serializers
from .models import BlogPost

class BlogPostSerializer(serializers.ModelSerializer):
    """
    Serializer for the BlogPost model.
    """
    author_name = serializers.ReadOnlyField(source='author.username')
    tags = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'description', 'content', 'author_name', 'tags',
            'mood', 'status', 'published_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['author', 'author_name', 'created_at', 'updated_at']

    def get_tags(self, obj):
        return [tag.strip() for tag in obj.tags.split(',')] if obj.tags else []

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['tags'] = self.get_tags(instance)
        return representation

def create(self, validated_data):
    # Set the author of the blog post to the current user
    validated_data['author'] = self.context['request'].user
    return super().create(validated_data)
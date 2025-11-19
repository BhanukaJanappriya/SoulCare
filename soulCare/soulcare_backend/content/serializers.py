# soulcare_backend/content/serializers.py

from rest_framework import serializers
from .models import ContentItem
from authapp.serializers import UserInfoSerializer
from authapp.models import User

class ContentItemSerializer(serializers.ModelSerializer):
    """
    Serializer for the ContentItem model.
    Handles file uploads and shows nested owner/shared_with data.
    """
    owner = UserInfoSerializer(read_only=True)
    shared_with = UserInfoSerializer(many=True, read_only=True)
    
    # This field is for *receiving* the list of patient IDs when sharing
    shared_with_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.filter(role='user'),
        source='shared_with', # Links this field to the 'shared_with' model field
        write_only=True,
        required=False # Not required on creation
    )
    
    # Use FileField for file uploads
    file = serializers.FileField(use_url=True)
    
    #Read-only 'tags' field as an array
    tags = serializers.SerializerMethodField(read_only=True)
    
    # --- NEW: Write-only 'tags_input' field for the string ---
    tags_input = serializers.CharField(
        write_only=True,
        source='tags', # This maps 'tags_input' to the 'tags' model field
        required=False,
        allow_blank=True
    )

    class Meta:
        model = ContentItem
        fields = [
            'id', 
            'title', 
            'description', 
            'type', 
            'file',         # This will be a URL when reading
            'owner', 
            'shared_with',  # This is a list of user objects when reading
            'shared_with_ids', # This is a list of IDs when writing
            'created_at',
            'tags',
            'tags_input',
        ]
        read_only_fields = ('id', 'owner', 'created_at', 'shared_with','tags')
        
  # --- NEW: Function to split the tags string into an array ---
            
    def get_tags(self, obj):
        if obj.tags:
            # Split the string by comma, strip whitespace, and filter out empty strings
            return [tag.strip() for tag in obj.tags.split(',') if tag.strip()]
        return [] # Return an empty array if tags are blank
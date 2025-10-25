# journal/serializers.py

from rest_framework import serializers
from .models import Tag, JournalEntry

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']

class JournalEntrySerializer(serializers.ModelSerializer):
    # Use the TagSerializer to display full tag objects when reading data
    tags = TagSerializer(many=True, read_only=True)

    # Accept a list of tag names when creating/updating an entry
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=50),
        write_only=True,
        required=False
    )

    class Meta:
        model = JournalEntry
        fields = [
            'id', 'title', 'content', 'mood_emoji', 'is_private',
            'created_at', 'updated_at', 'tags', 'tag_names'
        ]
        read_only_fields = ['patient'] # Patient is set automatically

    def create(self, validated_data):
        # Pop the tag_names from the data, as it's not a direct field on the model
        tag_names = validated_data.pop('tag_names', [])
        journal_entry = JournalEntry.objects.create(**validated_data)

        # For each tag name, get it if it exists, or create it if it's new
        for tag_name in tag_names:
            tag, _ = Tag.objects.get_or_create(name=tag_name.lower())
            journal_entry.tags.add(tag)

        return journal_entry

    def update(self, instance, validated_data):
        tag_names = validated_data.pop('tag_names', None)

        # Perform the standard update for other fields
        instance = super().update(instance, validated_data)

        # If tag_names were provided, update the tags
        if tag_names is not None:
            instance.tags.clear() # Remove old tags
            for tag_name in tag_names:
                tag, _ = Tag.objects.get_or_create(name=tag_name.lower())
                instance.tags.add(tag)

        return instance

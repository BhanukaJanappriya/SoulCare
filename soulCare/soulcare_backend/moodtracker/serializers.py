# In soulcare_backend/moodtracker/serializers.py

from rest_framework import serializers
from .models import MoodEntry, Activity, Tag # NEW: import Tag

class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ['id', 'name']

# NEW: Serializer for the Tag model
class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']

class MoodEntrySerializer(serializers.ModelSerializer):
    activities = serializers.SlugRelatedField(
        many=True,
        slug_field='name',
        queryset=Activity.objects.all()
    )
    # NEW: Add a field for tags, works just like activities
    tags = serializers.SlugRelatedField(
        many=True,
        slug_field='name',
        queryset=Tag.objects.all()
    )

    class Meta:
        model = MoodEntry
        # NEW: Add 'tags' to the list of fields
        fields = ['id', 'date', 'mood', 'energy', 'anxiety', 'notes', 'activities', 'tags', 'created_at']

    def create(self, validated_data):
        # Pop the relationship data before creating the main object
        activity_names = validated_data.pop('activities', [])
        tag_names = validated_data.pop('tags', []) # NEW: handle tags

        mood_entry = MoodEntry.objects.create(**validated_data)

        # Link activities
        for name in activity_names:
            activity, _ = Activity.objects.get_or_create(name=name)
            mood_entry.activities.add(activity)

        # NEW: Link tags
        for name in tag_names:
            tag, _ = Tag.objects.get_or_create(name=name)
            mood_entry.tags.add(tag)

        return mood_entry

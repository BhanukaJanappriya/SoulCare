# In soulcare_backend/moodtracker/serializers.py

from rest_framework import serializers
from .models import MoodEntry, Activity

class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ['id', 'name']

class MoodEntrySerializer(serializers.ModelSerializer):
    # We want to send back the names of the activities, not just their IDs.
    activities = serializers.SlugRelatedField(
        many=True,
        slug_field='name',
        queryset=Activity.objects.all()
    )

    class Meta:
        model = MoodEntry
        # The 'patient' will be set automatically from the logged-in user, so we don't need it here.
        fields = ['id', 'date', 'mood', 'energy', 'anxiety', 'notes', 'activities', 'created_at']

    def create(self, validated_data):
        # This logic correctly handles creating the mood entry and linking the activities.
        activities_data = validated_data.pop('activities')
        mood_entry = MoodEntry.objects.create(**validated_data)

        # Link the activities to the newly created mood entry
        for activity_name in activities_data:
            activity, created = Activity.objects.get_or_create(name=activity_name)
            mood_entry.activities.add(activity)

        return mood_entry

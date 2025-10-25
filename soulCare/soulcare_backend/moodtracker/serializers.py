# In soulcare_backend/moodtracker/serializers.py

from rest_framework import serializers
from .models import MoodEntry, Activity

class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ['id', 'name']

class MoodEntrySerializer(serializers.ModelSerializer):
    # ✅ FIX 1: For READING data (GET requests).
    # This will show the activity names in the API response, which your frontend uses.
    activities = serializers.SlugRelatedField(
        many=True,
        read_only=True, # This field is only for sending data out.
        slug_field='name'
    )

    # ✅ FIX 2: For WRITING data (POST requests).
    # This creates a new field that accepts a list of activity IDs.
    activity_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True, # This field is only for receiving data.
        queryset=Activity.objects.all(),
        source='activities' # This maps the input to the actual 'activities' model field.
    )

    class Meta:
        model = MoodEntry
        # ✅ FIX 3: Update the fields list.
        # 'patient' is set automatically in the view.
        # 'activities' is for reading, 'activity_ids' is for writing.
        fields = ['id', 'date', 'mood', 'energy', 'anxiety', 'notes', 'activities', 'activity_ids', 'created_at']

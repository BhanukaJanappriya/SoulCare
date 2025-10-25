# In soulcare_backend/moodtracker/admin.py

from django.contrib import admin
from .models import MoodEntry, Activity, Tag # NEW: import Tag

@admin.register(MoodEntry)
class MoodEntryAdmin(admin.ModelAdmin):
    list_display = ('patient', 'date', 'mood', 'energy', 'anxiety', 'created_at')
    list_filter = ('date', 'patient')
    search_fields = ('notes', 'patient__username')
    ordering = ('-date',)

@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    search_fields = ('name',)

# NEW: Register the Tag model with the admin site
@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    search_fields = ('name',)

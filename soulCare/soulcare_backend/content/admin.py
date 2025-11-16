# soulcare_backend/content/admin.py
from django.contrib import admin
from .models import ContentItem

@admin.register(ContentItem)
class ContentItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'type', 'owner', 'created_at')
    list_filter = ('type', 'owner')
    search_fields = ('title', 'description', 'owner__username')
    # This filter is very helpful in the admin
    filter_horizontal = ('shared_with',)
from django.contrib import admin
from .models import ReactionTimeResult, MemoryGameResult, StroopGameResult
from django.http import HttpResponse
import csv
import datetime

# --- Custom Admin Action for CSV Export ---

def export_as_csv(modeladmin, request, queryset):
    """
    Generic admin action to export selected queryset data as a CSV file.
    """
    # Use the model's fields, excluding user and created_at if they are not needed in the matrix
    # Or just use all fields (recommended for a complete matrix)
    model = queryset.model
    field_names = [field.name for field in model._meta.fields]

    # Exclude technical fields (optional, but cleaner)
    # field_names = [f for f in field_names if f not in ('id', 'user_id')]

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename={}_{}.csv'.format(
        model._meta.verbose_name_plural.replace(' ', '_'),
        datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    )
    writer = csv.writer(response)

    # Write header row
    writer.writerow(field_names)

    # Write data rows
    for obj in queryset:
        row = [getattr(obj, field) for field in field_names]
        writer.writerow(row)

    return response

export_as_csv.short_description = "Export Selected Results as CSV"

# --- Admin Classes for each Game Result ---

class ReactionTimeResultAdmin(admin.ModelAdmin):
    list_display = ('user', 'reaction_time_ms', 'post_game_mood', 'created_at')
    list_filter = ('created_at', 'post_game_mood')
    search_fields = ('user__username', 'reaction_time_ms')
    actions = [export_as_csv] # <--- Add the export action

class MemoryGameResultAdmin(admin.ModelAdmin):
    list_display = ('user', 'max_sequence_length', 'total_attempts', 'post_game_mood', 'created_at')
    list_filter = ('created_at', 'max_sequence_length')
    search_fields = ('user__username', 'max_sequence_length')
    actions = [export_as_csv] # <--- Add the export action

class StroopGameResultAdmin(admin.ModelAdmin):
    list_display = ('user', 'total_correct', 'interference_score_ms', 'total_time_s', 'post_game_mood', 'created_at')
    list_filter = ('created_at', 'total_correct')
    search_fields = ('user__username', 'total_correct')
    actions = [export_as_csv] # <--- Add the export action

# --- Register Models ---
admin.site.register(ReactionTimeResult, ReactionTimeResultAdmin)
admin.site.register(MemoryGameResult, MemoryGameResultAdmin)
admin.site.register(StroopGameResult, StroopGameResultAdmin)

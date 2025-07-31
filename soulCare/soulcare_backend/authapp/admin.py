from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, PatientProfile, DoctorProfile, CounselorProfile

#  Optional: Show more fields in list view
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'role', 'is_verified', 'is_staff')
    list_filter = ('role', 'is_verified')
    actions = ['approve_selected_users']  #  Step 2: Add custom action

    @admin.action(description='Approve selected users')
    def approve_selected_users(self, request, queryset):
        updated = queryset.filter(is_verified=False, role__in=['doctor', 'counselor','user']).update(is_verified=True)
        self.message_user(request, f"{updated} user(s) successfully approved.")

# Register models
admin.site.register(User, UserAdmin)
admin.site.register(PatientProfile)
admin.site.register(DoctorProfile)
admin.site.register(CounselorProfile)


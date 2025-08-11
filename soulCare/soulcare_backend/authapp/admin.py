from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, DoctorProfile, CounselorProfile, PatientProfile

# This is the class that will customize how our User model is displayed
class UserAdmin(BaseUserAdmin):
    # The fields to be displayed in the list view of users
    list_display = ('username', 'email', 'role', 'is_staff', 'is_verified', 'is_active')

    # The fields to be displayed in the detail/edit view of a user
    # We add our custom 'role' and 'is_verified' fields to the existing fieldsets
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('email',)}),
        
        # --- THIS IS THE CUSTOMIZATION ---
        # Add a new section for our custom fields
        ('Custom Fields', {'fields': ('role', 'is_verified')}),
        # --- END OF CUSTOMIZATION ---

        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    # Make 'role' and 'is_verified' searchable in the admin
    search_fields = ('username', 'email', 'role')
    # Add filters for role and verification status
    list_filter = ('role', 'is_verified', 'is_staff', 'is_active')

# Unregister the default User admin if it's already registered
# and register our custom UserAdmin instead.

try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass

admin.site.register(User, UserAdmin)
admin.site.register(DoctorProfile)
admin.site.register(CounselorProfile)
admin.site.register(PatientProfile)
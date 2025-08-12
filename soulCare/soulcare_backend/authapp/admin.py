from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, DoctorProfile, CounselorProfile, PatientProfile


class UserAdmin(BaseUserAdmin):
    
    list_display = ('username', 'email', 'role', 'is_staff', 'is_verified', 'is_active')

    
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('email',)}),
        
        
        
        ('Custom Fields', {'fields': ('role', 'is_verified')}),
        

        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    
    search_fields = ('username', 'email', 'role')
    
    list_filter = ('role', 'is_verified', 'is_staff', 'is_active')




try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass

admin.site.register(User, UserAdmin)
admin.site.register(DoctorProfile)
admin.site.register(CounselorProfile)
admin.site.register(PatientProfile)
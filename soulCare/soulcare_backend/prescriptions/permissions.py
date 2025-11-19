# soulcare_backend/prescriptions/permissions.py

from rest_framework.permissions import BasePermission

class IsDoctorAndOwner(BasePermission):
    """
    Custom permission to only allow the doctor who created a prescription
    to edit or delete it.
    """

    def has_permission(self, request, view):
        # Allow any authenticated user to list or view (GET)
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        # Only allow doctors to create (POST)
        if request.method == 'POST':
            return request.user.role == 'doctor'
        
        # For other methods (PUT, PATCH, DELETE), check object-level permission
        return request.user.role == 'doctor'

    def has_object_permission(self, request, view, obj):
        # Allow any user to view (GET) the object
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return obj.patient == request.user or obj.doctor == request.user

        # Only allow the doctor who *created* the object to delete/update it
        return obj.doctor == request.user
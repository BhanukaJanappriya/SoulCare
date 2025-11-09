# soulcare_backend/chat/permissions.py
# (This is a NEW FILE)

from rest_framework.permissions import BasePermission

class IsSender(BasePermission):
    """
    Custom permission to only allow the sender of a message to delete it.
    """
    def has_object_permission(self, request, view, obj):
        # Check if the user making the request is the sender of the message
        return obj.sender == request.user
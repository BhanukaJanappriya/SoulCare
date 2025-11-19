from rest_framework import permissions

class IsAdminOrCounselor(permissions.BasePermission):
    """
    Custom permission to allow only 'admin' and 'counselor' users access.
    """
    def has_permission(self, request, view):
        # Check if the user is authenticated
        if not request.user.is_authenticated:
            return False

        # Check the user's role (assuming User model has a 'role' field)
        return request.user.role in ('admin', 'counselor')

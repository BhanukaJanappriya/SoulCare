# blog/permissions.py

from rest_framework import permissions

class IsAuthorOrAdmin(permissions.BasePermission):
    """
    Custom permission to allow only the author of an object to edit/delete it,
    or a staff/superuser.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request (handled by IsAuthenticatedOrReadOnly)
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions (POST/PUT/PATCH/DELETE) are only allowed to the author of the post
        # OR if the user is a staff/superuser (Admin/Doctor/Counselor based on your role logic)

        # Check if the user is a superuser or admin
        if request.user.is_superuser or request.user.is_staff:
             return True

        # Check if the user is the author of the blog post
        # obj.author is the ForeignKey field
        return obj.author == request.user

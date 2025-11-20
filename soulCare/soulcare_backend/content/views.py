# soulcare_backend/content/views.py

from rest_framework import viewsets, status, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser,JSONParser
from .models import ContentItem
from .serializers import ContentItemSerializer
from authapp.models import User

class ContentViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for Providers to manage their ContentItems.
    - list: Returns all content items owned by the user.
    - create: Uploads a new content item.
    - destroy: Deletes a content item.
    - share (custom action): Updates the list of patients an item is shared with.
    """
    serializer_class = ContentItemSerializer
    permission_classes = [IsAuthenticated]
    # Add parsers to handle file uploads
    parser_classes = [MultiPartParser, FormParser,JSONParser]

    def get_queryset(self):
        """
        Providers can only see and manage their *own* content.
        """
        user = self.request.user
        
        if user.role == 'admin' or user.is_superuser:
            return ContentItem.objects.all().order_by('-created_at')
        
        if user.role not in ['doctor', 'counselor']:
            return ContentItem.objects.none()
        return ContentItem.objects.filter(owner=user)

    def perform_create(self, serializer):
        """
        Automatically assign the logged-in provider as the owner.
        """
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['patch'], url_path='share')
    def share(self, request, pk=None):
        """
        Custom action to update the 'shared_with' list for a content item.
        Expects a body like: { "patient_ids": [1, 5, 12] }
        """
        content_item = self.get_object() # This already checks if the provider is the owner
        
        patient_ids = request.data.get('patient_ids', [])
        
        try:
            # Get the actual User objects for the patients
            patients = User.objects.filter(role='user', id__in=patient_ids)
            # 'set' instantly replaces the list with the new one
            content_item.shared_with.set(patients)
            
            # Return the updated object
            serializer = self.get_serializer(content_item)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class SharedWithMeView(generics.ListAPIView):
    """
    A read-only view for *patients* to see content shared with them.
    """
    serializer_class = ContentItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Returns only the ContentItems where the logged-in user
        is in the 'shared_with' list.
        """
        user = self.request.user
        if user.role == 'user':
            # This uses the 'related_name' from the ContentItem model
            return user.shared_content.all().order_by('-created_at')
        
        return ContentItem.objects.none()
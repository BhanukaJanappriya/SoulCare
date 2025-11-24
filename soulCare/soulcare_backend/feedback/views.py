from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Feedback
from .serializers import FeedbackSerializer, FeedbackCreateSerializer

class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return FeedbackCreateSerializer
        return FeedbackSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            # Allow anyone to read feedback (we filter inside get_queryset)
            return [permissions.AllowAny()]
        if self.action == 'create':
            # Only logged-in users can post
            return [permissions.IsAuthenticated()]
        # Only admins can update/delete/approve
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        
        if self.action in ['approve', 'reject']:
          return Feedback.objects.all()
      
        # Default: Show only approved feedback
        queryset = Feedback.objects.filter(is_approved=True)

        # Admin Override: If user is admin AND requests 'all' mode, show everything
        # The frontend Admin page should send ?mode=admin
        if self.request.user.is_staff and self.request.query_params.get('mode') == 'admin':
            return Feedback.objects.all()
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        feedback = self.get_object()
        feedback.is_approved = True
        feedback.save()
        return Response({'status': 'approved'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAdminUser])
    def reject(self, request, pk=None):
        feedback = self.get_object()
        feedback.is_approved = False # Or delete it if you prefer
        feedback.save()
        return Response({'status': 'rejected'}, status=status.HTTP_200_OK)
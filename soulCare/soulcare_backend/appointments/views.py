from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Appointment
from .serializers import AppointmentReadSerializer, AppointmentWriteSerializer
from authapp.models import User

class AppointmentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        """
        Return the appropriate serializer class based on the request action.
        """
        if self.action in ['create', 'update', 'partial_update']:
            return AppointmentWriteSerializer
        return AppointmentReadSerializer

    def get_queryset(self):
        """
        Filter appointments based on the user's role.
        A user can only see appointments they are a part of.
        """
        user = self.request.user
        if user.role in ['doctor', 'counselor']:
            return Appointment.objects.filter(provider=user).select_related('patient__patientprofile')
        elif user.role == 'user':
            return Appointment.objects.filter(patient=user).select_related('provider__doctorprofile', 'provider__counselorprofile')
        return Appointment.objects.none()

    def perform_create(self, serializer):
        """
        When a patient creates an appointment, set them as the patient.
        The initial status is 'pending' by default from the model.
        """
        if self.request.user.role != 'user':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only patients can book appointments.')
        serializer.save(patient=self.request.user)

    @action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, pk=None):
        """
        A custom action for providers to confirm or cancel an appointment.
        e.g., POST to /api/appointments/5/update-status/
        """
        appointment = self.get_object()
        provider = request.user
        new_status = request.data.get('status')

        # Security Check 1: Ensure the user is the provider for this appointment
        if appointment.provider != provider:
            return Response({'error': 'You do not have permission to modify this appointment.'}, status=status.HTTP_403_FORBIDDEN)
        
        # Security Check 2: Validate the new status
        allowed_statuses = ['scheduled', 'cancelled']
        if new_status not in allowed_statuses:
            return Response({'error': f'Invalid status. Must be one of {allowed_statuses}.'}, status=status.HTTP_400_BAD_REQUEST)
        
        appointment.status = new_status
        appointment.save()
        
        # Return the updated appointment data using the read serializer
        serializer = AppointmentReadSerializer(appointment)
        return Response(serializer.data, status=status.HTTP_200_OK)
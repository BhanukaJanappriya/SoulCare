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
        
        - A user (patient) can only see their own appointments.
        - A provider (doctor/counselor) can see appointments they are the provider for.
        - A provider can ALSO filter their appointments by a specific patient
          by using a query parameter: /api/appointments/?patient_id=29
        """
        user = self.request.user
        
        # --- NEW: Check for patient_id filter from the provider ---
        patient_id = self.request.query_params.get('patient_id')
        
        if user.role in ['doctor', 'counselor']:
            queryset = Appointment.objects.filter(provider=user).select_related('patient__patientprofile')
            
            # If a patient_id is provided in the URL, filter the queryset further
            if patient_id:
                try:
                    return queryset.filter(patient_id=int(patient_id))
                except (ValueError, TypeError):
                    # Handle invalid patient_id gracefully
                    return Appointment.objects.none()
            
            # If no patient_id, return all appointments for the provider (original behavior)
            return queryset
            
        elif user.role == 'user':
            # Patient logic remains unchanged
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
        allowed_statuses = ['scheduled', 'cancelled','completed']
        if new_status not in allowed_statuses:
            return Response({'error': f'Invalid status. Must be one of {allowed_statuses}.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if new_status == 'completed' and appointment.status != 'scheduled':
            return Response({'error': 'Only scheduled appointments can be marked as completed.'}, status=status.HTTP_400_BAD_REQUEST)
        
        appointment.status = new_status
        appointment.save()
        
        # Return the updated appointment data using the read serializer
        serializer = AppointmentReadSerializer(appointment)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    
    @action(detail=True, methods=['post'], url_path='cancel-by-patient')
    def cancel_by_patient(self, request, pk=None):
        """
        A custom action for a patient to cancel their own appointment.
        e.g., POST to /api/appointments/5/cancel-by-patient/
        """
        appointment = self.get_object()
        patient = request.user

        # Security Check 1: Ensure the user is the patient for this appointment
        if appointment.patient != patient:
            return Response({'error': 'You do not have permission to cancel this appointment.'}, status=status.HTTP_403_FORBIDDEN)
        
        # Security Check 2: Ensure the appointment is in a cancellable state
        if appointment.status not in ['pending', 'scheduled']:
            return Response({'error': 'This appointment can no longer be cancelled.'}, status=status.HTTP_400_BAD_REQUEST)
        
        appointment.status = 'cancelled'
        appointment.save()
        
        # Return the updated appointment data
        serializer = AppointmentReadSerializer(appointment)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    #Delete Method
    def destroy(self, request, *args, **kwargs):
        """
        Allows a user to delete a past appointment.
        """
        appointment = self.get_object() # This correctly uses get_queryset to ensure the user owns the appointment
        user = request.user

        # Security Check 1: Redundant check to be extra safe
        if user != appointment.patient and user != appointment.provider:
            return Response({'error': 'You do not have permission to delete this appointment.'}, status=status.HTTP_403_FORBIDDEN)

        # Security Check 2: Business Logic - only allow deletion of PAST appointments
        if appointment.status not in ['completed', 'cancelled']:
            return Response({'error': 'Only completed or cancelled appointments can be deleted.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # If checks pass, perform the deletion
        self.perform_destroy(appointment)
        
        # Return a success response with no content, which is standard for DELETE
        return Response(status=status.HTTP_204_NO_CONTENT)
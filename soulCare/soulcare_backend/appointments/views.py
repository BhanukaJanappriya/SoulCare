from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Appointment,ProgressNote
from .serializers import AppointmentReadSerializer, AppointmentWriteSerializer,ProgressNoteSerializer
from authapp.models import User
from datetime import date
from authapp.utils import send_appointment_approved_email,send_appointment_cancelled_email

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
            queryset = Appointment.objects.filter(patient=user).select_related('provider__doctorprofile', 'provider__counselorprofile')
        
        
        filter_date_str = self.request.query_params.get('date')
        if filter_date_str:
            if filter_date_str == 'today':
                queryset = queryset.filter(date=date.today())
            else:
                try:
                    # Filter by a specific ISO date (YYYY-MM-DD)
                    filter_date = date.fromisoformat(filter_date_str)
                    queryset = queryset.filter(date=filter_date)
                except ValueError:
                    pass # Ignore invalid date formats
        # --- END OF ADDED BLOCK ---
            
        # Order by date and time
        return queryset.order_by('date', 'time')
    
    
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
        
        old_status = appointment.status
        appointment.status = new_status
        
        if new_status == 'cancelled':
            appointment.cancelled_by = 'provider'
        
        appointment.save()
        
        if old_status == 'pending' and new_status == 'scheduled':
            send_appointment_approved_email(appointment)
            
        elif new_status == 'cancelled' and old_status != 'cancelled':
            send_appointment_cancelled_email(appointment, cancelled_by_role='provider')
        
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
        
        appointment.cancelled_by = 'patient'
        
        appointment.save()
        
        send_appointment_cancelled_email(appointment, cancelled_by_role='patient')
        
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
    
    def perform_update(self, serializer):
        """
        Handle appointment updates (like Status changes) and send emails
        ONLY if the user has enabled notifications.
        """
        instance = serializer.save()
        
        # Send Approved Email?
        if instance.status == 'scheduled':
            # Check if patient has settings and if email_appointment_updates is True
            if hasattr(instance.patient, 'settings') and instance.patient.settings.email_appointment_updates:
                send_appointment_approved_email(instance)
        
        # Send Cancelled Email?
        elif instance.status == 'cancelled':
            if hasattr(instance.patient, 'settings') and instance.patient.settings.email_appointment_updates:
                send_appointment_cancelled_email(instance)
    
class ProgressNoteViewSet(viewsets.ModelViewSet):
    serializer_class = ProgressNoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        - Providers see ONLY notes they wrote for the specific patient.
        """
        user = self.request.user
        if user.role not in ['doctor', 'counselor']:
            return ProgressNote.objects.none()

        queryset = ProgressNote.objects.filter(provider=user)
        
        # Filter by patient_id (Required)
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
            
        return queryset

    def perform_create(self, serializer):
        # Auto-assign the logged-in provider
        serializer.save(provider=self.request.user)
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Appointment
from .serializers import AppointmentSerializer
from authapp.models import User

class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['doctor', 'counselor']:
            return Appointment.objects.filter(provider=user).select_related('patient__patientprofile')
        elif user.role == 'user':
            return Appointment.objects.filter(patient=user).select_related('provider__doctorprofile', 'provider__counselorprofile')
        return Appointment.objects.none()

    def create(self, request, *args, **kwargs):
        user = self.request.user
        if user.role != 'user':
            return Response({'error': 'Only patients can book appointments.'}, status=status.HTTP_403_FORBIDDEN)
        
        provider_id = request.data.get('provider')
        date = request.data.get('date')
        time = request.data.get('time')

        if not all([provider_id, date, time]):
            return Response({'error': 'Provider, date, and time are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            provider = User.objects.get(id=provider_id, role__in=['doctor', 'counselor'])
        except User.DoesNotExist:
            return Response({'error': 'Selected provider does not exist.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create the appointment instance without saving to the DB yet
        appointment = Appointment(
            patient=user, 
            provider=provider, 
            date=date, 
            time=time, 
            notes=request.data.get('notes', '')
        )
        # Now pass this instance to the serializer
        serializer = self.get_serializer(instance=appointment, data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
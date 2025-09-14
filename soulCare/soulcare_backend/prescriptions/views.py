from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Prescription
from .serializers import PrescriptionSerializer
from authapp.models import User # Import the User model

class PrescriptionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for prescriptions.
    - Doctors can create prescriptions.
    - Doctors and Patients can view prescriptions they are involved in.
    """
    serializer_class = PrescriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filter prescriptions based on the user's role.
        """
        user = self.request.user
        if user.role == 'doctor':
            # A doctor can see all prescriptions they have issued
            return Prescription.objects.filter(doctor=user)
        elif user.role == 'user':
            # A patient can see all prescriptions they have received
            return Prescription.objects.filter(patient=user)
        return Prescription.objects.none() # Other roles see nothing

    def perform_create(self, serializer):
        """
        Automatically set the doctor to the currently logged-in user.
        """
        if self.request.user.role != 'doctor':
            # This is a final security check
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only doctors can create prescriptions.")
        serializer.save(doctor=self.request.user)

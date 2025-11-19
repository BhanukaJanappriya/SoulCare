from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Prescription
from .serializers import PrescriptionSerializer
from authapp.models import User # Import the User model
from .permissions import IsDoctorAndOwner

class PrescriptionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for prescriptions.
    - Doctors can create prescriptions.
    - Doctors and Patients can view prescriptions they are involved in.
    """
    serializer_class = PrescriptionSerializer
    permission_classes = [IsAuthenticated,IsDoctorAndOwner]

    def get_queryset(self):
        """
        Filter prescriptions based on the user's role.
        """
        user = self.request.user
        
        # --- NEW: Check for patient_id filter from the doctor ---
        patient_id = self.request.query_params.get('patient_id')
        
        if user.role == 'doctor':
            queryset = Prescription.objects.filter(doctor=user)
            
            # If a patient_id is provided in the URL, filter the queryset further
            if patient_id:
                try:
                    return queryset.filter(patient_id=int(patient_id))
                except (ValueError, TypeError):
                    return Prescription.objects.none()
            
            # If no patient_id, return all prescriptions for the doctor (original behavior)
            return queryset
            
        elif user.role == 'user':
            # Patient logic remains unchanged
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

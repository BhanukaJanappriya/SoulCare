from django.db import models
from django.conf import settings

class Prescription(models.Model):
    # A patient can have many prescriptions, a doctor can issue many.
    patient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='prescriptions_as_patient')
    doctor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='prescriptions_as_doctor')
    
    diagnosis = models.TextField()
    date_issued = models.DateField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Prescription for {self.patient.username} by {self.doctor.username} on {self.date_issued}"

class Medication(models.Model):
    # Each prescription can have multiple medications.
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name='medications')
    
    name = models.CharField(max_length=255)
    dosage = models.CharField(max_length=100) # e.g., "500mg", "1 tablet"
    frequency = models.CharField(max_length=100) # e.g., "Twice a day", "As needed"
    instructions = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.dosage})"
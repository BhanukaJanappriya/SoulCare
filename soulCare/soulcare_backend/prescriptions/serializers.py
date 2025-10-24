from rest_framework import serializers
from .models import Prescription, Medication
from authapp.models import User # We need this to validate the patient
from authapp.serializers import UserInfoSerializer

class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = ['id','name', 'dosage', 'frequency', 'instructions']
        read_only_fields = ['id']

class PrescriptionSerializer(serializers.ModelSerializer):
    # Nested serializer for medications (keep as is)
    medications = MedicationSerializer(many=True)

    # --- NEW: Field for WRITING patient ID ---
    patient_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='user'), # Validate input ID is a patient
        source='patient',       # Map this input field to the 'patient' model field
        write_only=True         # Use this field ONLY for writing (POST/PUT/PATCH)
    )

    # --- MODIFIED: Field for READING patient details ---
    patient = UserInfoSerializer(read_only=True) # Display nested info on GET

    # --- MODIFIED: Field for READING doctor details ---
    # Assuming PatientForDoctorSerializer works for doctors too, or use another appropriate serializer
    doctor = UserInfoSerializer(read_only=True)  # Display nested info on GET

    class Meta:
        model = Prescription
        # ---> MODIFIED: Update the fields list <---
        fields = [
            'id',
            'patient',        # Read representation (nested object)
            'patient_id',     # Write representation (ID input) - MUST BE INCLUDED
            'doctor',         # Read representation (nested object)
            'diagnosis',
            'date_issued',
            'notes',
            'medications'
        ]
        # ---> MODIFIED: Update read_only_fields <---
        # 'patient' and 'doctor' are handled by their read_only=True definition
        # 'doctor' field value is set in the view's perform_create, so it's effectively read-only from the client's perspective during POST
        read_only_fields = ['id', 'date_issued']


    # --- Keep the create method as is ---
    def create(self, validated_data):
        medications_data = validated_data.pop('medications')
        # 'validated_data' now correctly contains the 'patient' model instance
        # because 'patient_id' field used source='patient'.
        # The 'doctor' is added in the view's perform_create method.
        prescription = Prescription.objects.create(**validated_data)
        for medication_data in medications_data:
            Medication.objects.create(prescription=prescription, **medication_data)
        return prescription
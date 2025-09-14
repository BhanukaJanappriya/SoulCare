from rest_framework import serializers
from .models import Prescription, Medication
from authapp.models import User # We need this to validate the patient

class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = ['name', 'dosage', 'frequency', 'instructions']

class PrescriptionSerializer(serializers.ModelSerializer):
    # This nested serializer allows us to create medications at the same time as the prescription
    medications = MedicationSerializer(many=True)
    # We'll send the patient's ID when creating a prescription
    patient = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(role='user'))

    class Meta:
        model = Prescription
        fields = ['id', 'patient', 'doctor', 'diagnosis', 'date_issued', 'notes', 'medications']
        read_only_fields = ['id', 'doctor', 'date_issued'] # Doctor is set automatically from the request user

    def create(self, validated_data):
        # Pop the nested medications data
        medications_data = validated_data.pop('medications')
        # Create the main Prescription object
        prescription = Prescription.objects.create(**validated_data)
        # Create each Medication object and link it to the new Prescription
        for medication_data in medications_data:
            Medication.objects.create(prescription=prescription, **medication_data)
        return prescription
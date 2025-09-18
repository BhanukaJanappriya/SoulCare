from rest_framework import serializers
from .models import Appointment
from authapp.serializers import ProviderListSerializer # Import our new serializer

class AppointmentSerializer(serializers.ModelSerializer):
    # Use the read-only ProviderListSerializer to show nested user info
    patient = ProviderListSerializer(read_only=True)
    provider = ProviderListSerializer(read_only=True)

    class Meta:
        model = Appointment
        fields = ['id', 'patient', 'provider', 'date', 'time', 'status', 'notes', 'created_at']
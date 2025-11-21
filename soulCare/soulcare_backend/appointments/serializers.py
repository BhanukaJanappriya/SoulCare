from rest_framework import serializers
from .models import Appointment
from authapp.models import User
from authapp.serializers import ProviderListSerializer # Keep this for the read view

class AppointmentReadSerializer(serializers.ModelSerializer):
    """
    A read-only serializer to display detailed appointment information.
    """
    patient = ProviderListSerializer(read_only=True)
    provider = ProviderListSerializer(read_only=True)
    
    has_review = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = ['id', 'patient', 'provider', 'date', 'time', 'status', 'notes', 'created_at','has_review']
        
    def get_has_review(self, obj):
        # Check if the appointment has a related review
        return hasattr(obj, 'review')


class AppointmentWriteSerializer(serializers.ModelSerializer):
    """
    A write-only serializer for creating and updating appointments.
    """
    # Patient will be set automatically from the request user.
    # Provider will be a simple ID provided by the frontend.
    provider = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role__in=['doctor', 'counselor'], is_verified=True)
    )

    class Meta:
        model = Appointment
        fields = ['id', 'provider', 'date', 'time', 'notes']
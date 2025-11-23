from rest_framework import serializers
from .models import Review
from appointments.models import Appointment

class ReviewSerializer(serializers.ModelSerializer):
    appointment_id = serializers.PrimaryKeyRelatedField(
        queryset=Appointment.objects.all(), 
        source='appointment',
        write_only=True
    )

    class Meta:
        model = Review
        fields = ['id', 'appointment_id', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate(self, data):
        appointment = data['appointment']
        user = self.context['request'].user

        if appointment.patient != user:
            raise serializers.ValidationError("You can only review your own appointments.")
        
        if appointment.status != 'completed':
            raise serializers.ValidationError("You can only rate completed appointments.")
            
        return data
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Avg
from .models import Review
from .serializers import ReviewSerializer

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'user':
            return Review.objects.filter(patient=user)
        elif user.role in ['doctor', 'counselor']:
            return Review.objects.filter(provider=user)
        return Review.objects.none()

    def perform_create(self, serializer):
        # 1. Save Review
        appointment = serializer.validated_data['appointment']
        provider = appointment.provider
        patient = self.request.user
        
        serializer.save(patient=patient, provider=provider)

        # 2. Update Provider Average Rating
        self.update_provider_average_rating(provider)

    def update_provider_average_rating(self, provider):
        avg_rating = Review.objects.filter(provider=provider).aggregate(Avg('rating'))['rating__avg'] or 0
        avg_rating = round(avg_rating, 1)

        if provider.role == 'doctor' and hasattr(provider, 'doctorprofile'):
            provider.doctorprofile.rating = avg_rating
            provider.doctorprofile.save()
        elif provider.role == 'counselor' and hasattr(provider, 'counselorprofile'):
            provider.counselorprofile.rating = avg_rating
            provider.counselorprofile.save()
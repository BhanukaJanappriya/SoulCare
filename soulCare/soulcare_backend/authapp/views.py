from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import LoginSerializer,PatientRegistrationSerializer, DoctorRegistrationSerializer, CounselorRegistrationSerializer,UserDetailSerializer,AdminUserManagementSerializer,ProviderListSerializer,ProviderScheduleSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics

from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from .models import User,ProviderSchedule
from django.db.models import Count, Q
from datetime import date,datetime,timedelta
from appointments.models import Appointment


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class PatientRegisterView(generics.CreateAPIView):
    serializer_class = PatientRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        response_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "profile": {
                "nic": user.patientprofile.nic,
                "full_name":user.patientprofile.full_name,
                "contact_number": user.patientprofile.contact_number,
                "address": user.patientprofile.address,
                "dob": user.patientprofile.dob,
                "health_issues": user.patientprofile.health_issues,
            }
        }
        return Response(response_data,status=status.HTTP_201_CREATED)

class DoctorRegisterView(generics.CreateAPIView):
    serializer_class = DoctorRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        response_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "profile": {
                "nic": user.doctorprofile.nic,
                "full_name":user.doctorprofile.full_name,
                "contact_number": user.doctorprofile.contact_number,
                "specialization": user.doctorprofile.specialization,
                "availability":user.doctorprofile.availability,
                "license_number":user.doctorprofile.license_number,
            }
        }
        return Response(response_data,status=status.HTTP_201_CREATED)

class CounselorRegisterView(generics.CreateAPIView):
    serializer_class = CounselorRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        response_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "profile": {
                "nic": user.counselorprofile.nic,
                "full_name":user.counselorprofile.full_name,
                "contact_number": user.counselorprofile.contact_number,
                "expertise": user.counselorprofile.expertise, 
                "license_number": user.counselorprofile.license_number,
            }
        }
        return Response(response_data,status=status.HTTP_201_CREATED)
    


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserDetailSerializer(request.user)
        return Response(serializer.data)
    

class AdminUserViewSet(viewsets.ModelViewSet):

    
    permission_classes = [IsAuthenticated, IsAdminUser]

    
    queryset = User.objects.all().order_by('id')

    
    serializer_class = AdminUserManagementSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        role = self.request.query_params.get('role')
        if role:
            return queryset.filter(role=role)
        return queryset
    

class AdminDashboardStatsView(APIView):
    
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request, *args, **kwargs):
        
        doctor_count = User.objects.filter(role='doctor').count()
        counselor_count = User.objects.filter(role='counselor').count()
        patient_count = User.objects.filter(role='user').count()

        
        pending_verifications = User.objects.filter(
            Q(role='doctor') | Q(role='counselor'),
            is_verified=False
        ).count()

        
        recent_users = User.objects.all().order_by('-date_joined')[:5]
        
        recent_users_serializer = AdminUserManagementSerializer(recent_users, many=True)

        
        stats = {
            'total_doctors': doctor_count,
            'total_counselors': counselor_count,
            'total_patients': patient_count,
            'pending_verifications': pending_verifications,
            'recent_users': recent_users_serializer.data
        }

        return Response(stats, status=status.HTTP_200_OK)
    

class ProviderListView(generics.ListAPIView):
    """
    Provides a list of all verified doctors and counselors for patients to view.
    """
    serializer_class = ProviderListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(
            Q(role='doctor') | Q(role='counselor'),
            is_verified=True
        ).select_related('doctorprofile', 'counselorprofile')
        
        
class ProviderScheduleViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for providers to manage their own weekly availability schedules.
    """
    serializer_class = ProviderScheduleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # A provider can only see and manage their own schedule
        return ProviderSchedule.objects.filter(provider=self.request.user)

    def perform_create(self, serializer):
        # When creating a schedule, automatically assign it to the logged-in provider
        serializer.save(provider=self.request.user)
        
        
        
class ProviderAvailabilityView(APIView):
    """
    Calculates the available appointment slots for a given provider and date range.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, provider_id, *args, **kwargs):
        # 1. Get query parameters
        try:
            start_date_str = request.query_params.get('start_date')
            end_date_str = request.query_params.get('end_date')
            start_date = date.fromisoformat(start_date_str)
            end_date = date.fromisoformat(end_date_str)
        except (ValueError, TypeError):
            return Response({'error': 'Invalid or missing date range.'}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Define appointment duration (e.g., 60 minutes)
        slot_duration = timedelta(minutes=60)

        # 3. Fetch the provider's general schedule and booked appointments
        provider_schedules = ProviderSchedule.objects.filter(provider_id=provider_id)
        booked_appointments = Appointment.objects.filter(
            provider_id=provider_id,
            date__range=[start_date, end_date],
            status__in=['scheduled', 'pending'] # Consider pending slots as booked
        )

        # Create a quick lookup for booked slots
        booked_slots = {(app.date, app.time) for app in booked_appointments}

        available_slots = {}
        current_date = start_date
        while current_date <= end_date:
            day_slots = []
            weekday = current_date.weekday() # Monday is 0, Sunday is 6

            # Find all working hour blocks for this day of the week
            for schedule in provider_schedules.filter(day_of_week=weekday):
                current_time = datetime.combine(current_date, schedule.start_time)
                end_time = datetime.combine(current_date, schedule.end_time)

                # Iterate through the working hours, creating slots
                while current_time + slot_duration <= end_time:
                    slot_time = current_time.time()
                    # Check if this slot is already booked
                    if (current_date, slot_time) not in booked_slots:
                        day_slots.append(slot_time.strftime('%H:%M'))
                    
                    current_time += slot_duration
            
            if day_slots:
                available_slots[current_date.isoformat()] = day_slots
            
            current_date += timedelta(days=1)

        return Response(available_slots, status=status.HTTP_200_OK)
    
    

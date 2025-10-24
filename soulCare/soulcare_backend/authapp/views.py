from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import LoginSerializer,PatientRegistrationSerializer, DoctorRegistrationSerializer, CounselorRegistrationSerializer,UserDetailSerializer,AdminUserManagementSerializer,ProviderListSerializer,ProviderScheduleSerializer,UserInfoSerializer,PatientDetailSerializer, UserProfileUpdateSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics

from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from rest_framework.exceptions import PermissionDenied, NotFound
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



class UserDetailView(generics.RetrieveUpdateAPIView):
    """
    Handles GET for user details and PUT/PATCH for profile updates.
    """
    permission_classes = [IsAuthenticated]

    # We only want to retrieve/update the logged-in user
    def get_object(self):
        return self.request.user

    # Use the UserDetailSerializer for GET (Read) requests
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return UserDetailSerializer
        # Use the new serializer for PATCH/PUT (Update) requests
        return UserProfileUpdateSerializer
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


class ProviderDetailView(generics.RetrieveAPIView):
    """
    Provides the detailed public profile for a single doctor or counselor.
    """
    serializer_class = ProviderListSerializer # We can reuse our detailed serializer
    permission_classes = [IsAuthenticated]
    queryset = User.objects.filter(
        Q(role='doctor') | Q(role='counselor'),
        is_verified=True
    )
    lookup_field = 'pk' # This tells the view to find the user by their primary key (ID)


class DoctorPatientsView(APIView):
    """
    Returns a list of unique patients associated with the logged-in doctor
    based on past or present appointments.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Ensure the user is a doctor
        if request.user.role not in ['doctor', 'counselor'] :
            return Response({"detail": "Permission denied. Only doctors can access this list."}, status=403)

        # Get distinct patient IDs from appointments linked to this doctor
        patient_ids = Appointment.objects.filter(
            provider=request.user # Filter by the logged-in doctor
        ).values_list('patient', flat=True).distinct() # Get unique patient IDs

        # Fetch the User objects for these patients, ensuring they are patients ('user' role)
        patients = User.objects.filter(id__in=patient_ids, role='user')

        # Serialize the patient data
        serializer = UserInfoSerializer(patients, many=True)
        return Response(serializer.data)



class PatientDetailView(generics.RetrieveAPIView):
    """
    API view to retrieve details for a specific patient.
    Ensures the requesting doctor/counselor is associated with the patient via an appointment.

    """
    serializer_class = PatientDetailSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk' # Use the primary key (ID) from the URL

    def get_queryset(self):
        # Pre-filter to only allow fetching users with the 'user' role
        return User.objects.filter(role='user')

    def get_object(self):
        # Get the patient object based on the URL pk, ensuring it's a 'user'
        try:
            patient = super().get_object()
        except User.DoesNotExist:
             raise NotFound("Patient not found.") # More specific error

        user = self.request.user

        # Allow access if the requester is an Admin
        if user.role == 'admin':
            return patient

        # Only Doctors and Counselors proceed beyond this point
        if user.role not in ['doctor', 'counselor']:
            raise PermissionDenied("You do not have permission to view patient details.")

        # Check if there's at least one appointment linking this provider and patient
        is_associated = Appointment.objects.filter(
            provider=user,
            patient=patient
        ).exists()

        if not is_associated:
            # You might allow admins to bypass this check if needed:
            # if not user.is_staff:
            raise PermissionDenied("You do not have appointment history with this patient.")

        # If needed, you could prefetch or annotate related data here
        # E.g., patient = User.objects.prefetch_related('patient_appointments', 'prescriptions_as_patient').get(pk=patient.pk)

        return patient

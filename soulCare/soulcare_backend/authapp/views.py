from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import LoginSerializer,PatientRegistrationSerializer, DoctorRegistrationSerializer, CounselorRegistrationSerializer,UserDetailSerializer,AdminUserManagementSerializer,ProviderListSerializer,ProviderScheduleSerializer,UserInfoSerializer,PatientDetailSerializer, UserProfileUpdateSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics

from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from rest_framework.exceptions import PermissionDenied, NotFound
from .models import User,ProviderSchedule,DoctorProfile, CounselorProfile
from django.db.models import Count, Q, Avg, Sum # ADDED Avg, Sum for aggregation
from datetime import date,datetime,timedelta
from django.utils import timezone # ADDED for timezone-aware date logic

# NEW IMPORTS FOR PATIENT DASHBOARD STATS
from habits.models import Habit # Import Habit model
from moodtracker.models import MoodEntry # Import MoodEntry model
# Appointment is already imported
from appointments.models import Appointment
from chat.models import Conversation, Message
from .utils import send_account_pending_email, send_account_verified_email,send_patient_welcome_email


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

        send_patient_welcome_email(user)

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

        send_account_pending_email(user)

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

        send_account_pending_email(user)

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

    def perform_update(self, serializer):
    # Get the user object BEFORE the update
        instance = serializer.instance
        old_verified_status = instance.is_verified

        # Perform the update
        updated_user = serializer.save()

        # Check if status changed from False to True
        if not old_verified_status and updated_user.is_verified:
            send_account_verified_email(updated_user)



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


class ProviderDashboardStatsView(APIView):
    """
    API endpoint to get dashboard statistics for a logged-in provider (doctor/counselor).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        if user.role not in ['doctor', 'counselor']:
            return Response({"error": "User is not a provider."}, status=status.HTTP_403_FORBIDDEN)

        # --- 1. Total Patients ---
        # Get all unique patient IDs from appointments where this user is the provider
        patient_ids = Appointment.objects.filter(provider=user).values_list('patient_id', flat=True).distinct()
        total_patients = len(patient_ids)

        # --- 2. Appointments Today ---
        today = date.today()
        appointments_today = Appointment.objects.filter(
            provider=user,
            date=today,
            status='scheduled' # Only count 'scheduled' appointments
        ).count()

        # --- 3. Pending Messages ---
        # Find all conversations for this provider
        user_conversations = Conversation.objects.filter(provider=user)
        # Count all messages in these conversations that are unread AND not sent by the provider
        pending_messages = Message.objects.filter(
            conversation__in=user_conversations,
            is_read=False
        ).exclude(sender=user).count()

        # --- 4. Average Rating ---
        average_rating = 5.0 # Default
        try:
            if user.role == 'doctor' and hasattr(user, 'doctorprofile'):
                average_rating = user.doctorprofile.rating
            elif user.role == 'counselor' and hasattr(user, 'counselorprofile'):
                average_rating = user.counselorprofile.rating
        except (DoctorProfile.DoesNotExist, CounselorProfile.DoesNotExist):
            pass # Keep the default 5.0 if profile somehow doesn't exist

        # --- Compile Stats ---
        stats_data = {
            'total_patients': total_patients,
            'appointments_today': appointments_today,
            'pending_messages': pending_messages,
            'average_rating': average_rating,
        }

        return Response(stats_data, status=status.HTTP_200_OK)


# NEW VIEW FOR PATIENT DASHBOARD STATS


# In soulcare_backend/authapp/views.py (PatientDashboardStatsView)

class PatientDashboardStatsView(APIView):
    """
    Provides real-time aggregated statistics for the Patient Dashboard Quick Stats and Progress.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        patient = request.user

        # Ensure user is a patient
        if patient.role != 'user':
            return Response({"error": "Access denied. Only patients can view this dashboard."}, status=status.HTTP_403_FORBIDDEN)

        # --- VARIABLE INITIALIZATION (CRITICAL FIX for Pylance errors) ---
        next_appointment_data = None
        daily_progress_percentage = 0

        # --- 1. Current Streak ---
        # The Habit model uses a 'user' Foreign Key
        longest_streak = Habit.objects.filter(user=patient).order_by('-streak').first()
        current_streak = longest_streak.streak if longest_streak else 0

        # --- 2. Today's Mood Score ---
        today = timezone.localdate()
        


        today_mood_avg = MoodEntry.objects.filter(
            patient=patient, # Assuming MoodEntry uses 'patient' or 'user' - using 'patient' for now
            date=today

        ).aggregate(
            avg_mood=Avg('mood')
        )['avg_mood'] or 0

        # --- 3. Meditation Time (Mock/Placeholder) ---
        total_meditation_minutes = 125
        meditation_sessions = 5

        # --- 4. Next Appointment ---
        now = timezone.now()
        next_appointment = Appointment.objects.filter(
            patient=patient,
            status='scheduled',
            start_time__gte=now
        ).order_by('start_time').first()

        # next_appointment_data initialized above. Only assigned here if an appointment exists.
        if next_appointment:
             next_appointment_data = {
                 'id': next_appointment.id,
                 'start_time': next_appointment.start_time.isoformat(),
                 'date': next_appointment.date.isoformat(),
                 'time': next_appointment.time.isoformat(timespec='minutes'),
             }

        # --- 5. Daily Progress Percentage (Mocked) ---
        # daily_progress_percentage initialized above. Assigned the mock value here.
        daily_progress_percentage = 75

        # --- Final Response ---
        return Response({
            'current_streak': current_streak,
            'today_mood_score': round(today_mood_avg, 1) if today_mood_avg else 0.0,
            'total_meditation_minutes': total_meditation_minutes,
            'meditation_sessions': meditation_sessions,
            'next_appointment': next_appointment_data, # Now always defined
            'daily_progress_percentage': daily_progress_percentage, # Now always defined
        })

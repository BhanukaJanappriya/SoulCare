from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User,PatientProfile,DoctorProfile,CounselorProfile,ProviderSchedule
#from appointments.serializers import AppointmentReadSerializer
#from prescriptions.serializers import PrescriptionSerializer

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid username or password")

        if user.role in ['doctor','counselor'] and not user.is_verified:
            raise serializers.ValidationError("Account not verified by admin yet")

        if not user.is_active:
            raise serializers.ValidationError("User is not active")

        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'role': user.role,
            'email': user.username,
        }

class PatientRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only = True)
    full_name = serializers.CharField()
    nic = serializers.CharField()
    contact_number =serializers.CharField()
    address = serializers.CharField()
    dob = serializers.DateField()
    health_issues = serializers.CharField(required=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'password','full_name', 'nic', 'contact_number', 'address', 'dob', 'health_issues']

    def create(self, validated_data):

        nic = validated_data.pop('nic')
        full_name = validated_data.pop("full_name")
        contact_number = validated_data.pop('contact_number')
        address = validated_data.pop('address')
        dob = validated_data.pop('dob')
        health_issues = validated_data.pop('health_issues', '')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role='user',
            is_verified=True

        )

        PatientProfile.objects.create(
            user=user,
            full_name = full_name,
            nic=nic,
            contact_number=contact_number,
            address=address,
            dob=dob,
            health_issues=health_issues,
        )

        return user

class DoctorRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    full_name = serializers.CharField()
    nic = serializers.CharField()
    contact_number = serializers.CharField()
    specialization = serializers.CharField()
    availability = serializers.CharField()
    license_number = serializers.CharField()

    class Meta:
        model = User
        fields = ['username', 'email', 'password','full_name','nic', 'contact_number','specialization','availability','license_number']

    def create(self, validated_data):
        # Pop DoctorProfile-specific fields
        nic = validated_data.pop('nic')
        full_name = validated_data.pop('full_name')
        contact_number = validated_data.pop('contact_number')
        specialization = validated_data.pop('specialization')
        availability = validated_data.pop('availability')
        license_number = validated_data.pop('license_number')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role='doctor',
            is_verified = False
        )

        DoctorProfile.objects.create(
            user=user,
            full_name=full_name,
            nic=nic,
            specialization=specialization,
            contact_number=contact_number,
            availability=availability,
            license_number = license_number,
        )

        return user

class CounselorRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    full_name = serializers.CharField()
    nic = serializers.CharField()
    expertise = serializers.CharField()
    contact_number = serializers.CharField()
    license_number = serializers.CharField()

    class Meta:
        model = User
        fields = ['username', 'email', 'password','full_name','nic', 'expertise', 'contact_number','license_number']

    def create(self, validated_data):
        # Pop CounselorProfile-specific fields
        nic = validated_data.pop('nic')
        full_name = validated_data.pop('full_name')
        expertise = validated_data.pop('expertise')
        contact_number = validated_data.pop('contact_number')
        license_number = validated_data.pop('license_number')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role='counselor',
            is_verified = False
        )

        CounselorProfile.objects.create(
            user=user,
            full_name = full_name,
            nic = nic,
            expertise=expertise,
            contact_number=contact_number,
            license_number = license_number,

        )

        return user

class DoctorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorProfile
        fields = ['full_name', 'nic', 'contact_number', 'specialization', 'availability', 'license_number','rating','profile_picture_url', 'bio']


class CounselorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CounselorProfile
        fields = ['full_name', 'nic', 'contact_number', 'expertise', 'license_number','rating','profile_picture_url', 'bio']

class PatientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientProfile
        fields = ['full_name', 'nic', 'contact_number', 'address', 'dob', 'health_issues']


class UserDetailSerializer(serializers.ModelSerializer):
    # This will dynamically serialize the profile based on the user's role
    profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'is_verified', 'profile']

    def get_profile(self, obj):
        if obj.role == 'doctor':
            profile = DoctorProfile.objects.get(user=obj)
            return DoctorProfileSerializer(profile).data
        if obj.role == 'counselor':
            profile = CounselorProfile.objects.get(user=obj)
            return CounselorProfileSerializer(profile).data
        if obj.role == 'user': # 'user' is the role for patients in your model
            profile = PatientProfile.objects.get(user=obj)
            return PatientProfileSerializer(profile).data
        return None




class AdminUserManagementSerializer(serializers.ModelSerializer):
    """
    Serializer for the Admin UI.
    Dynamically gets the full_name from the correct related profile based on the user's role.
    """
    # Use a SerializerMethodField to implement custom logic for getting the full_name.
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        # Define the fields the admin should be able to see and edit.
        fields = [
            'id',
            'username',
            'email',
            'role',
            'is_verified',   # This field can be updated by the admin.
            'is_active',     # This field can also be updated.
            'full_name',     # This comes from our custom method below.
            'date_joined'
        ]
        # For security, make fields that shouldn't be changed in this view read-only.
        # The admin will update is_verified and is_active via PATCH requests.
        read_only_fields = ['id', 'username', 'email', 'role', 'full_name', 'date_joined']

    def get_full_name(self, obj):
        """
        This method is called automatically by the SerializerMethodField.
        It checks the user's role and returns the full_name from the correct profile.
        `obj` is the User instance being serialized.
        """
        # The hasattr() check is a safety measure to prevent errors if a profile doesn't exist.
        if obj.role == 'doctor' and hasattr(obj, 'doctorprofile'):
            return obj.doctorprofile.full_name
        if obj.role == 'counselor' and hasattr(obj, 'counselorprofile'):
            return obj.counselorprofile.full_name
        if obj.role == 'user' and hasattr(obj, 'patientprofile'):
            return obj.patientprofile.full_name

        # As a safe fallback, return the user's username if no specific profile is found.
        return obj.username


class DoctorProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorProfile
        # Fields that the user is allowed to edit
        fields = ['full_name', 'contact_number', 'specialization', 'bio', 'profile_picture']
        read_only_fields = ['rating', 'nic', 'license_number', 'availability'] # Fields user cannot change

class CounselorProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CounselorProfile
        fields = ['full_name', 'contact_number', 'expertise', 'bio', 'profile_picture']
        read_only_fields = ['rating', 'nic', 'license_number']

class PatientProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientProfile
        fields = ['full_name', 'contact_number', 'address', 'dob', 'health_issues', 'profile_picture']
        read_only_fields = ['nic']


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    # This remains SerializerMethodField for READ purposes (GET)
    profile = serializers.SerializerMethodField(read_only=True)

    # These fields are where the incoming data is mapped (WRITE purposes)
    # NOTE: The source='profile' is REMOVED to align with the update logic
    patient_profile_update = PatientProfileUpdateSerializer(required=False) # <--- REMOVED source='patientprofile'
    doctor_profile_update = DoctorProfileUpdateSerializer(required=False)   # <--- REMOVED source='doctorprofile'
    counselor_profile_update = CounselorProfileUpdateSerializer(required=False) # <--- REMOVED source='counselorprofile'


    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role', 'profile',
            # Include the writable nested fields here:
            'patient_profile_update', 'doctor_profile_update', 'counselor_profile_update'
        ]
        read_only_fields = ['id', 'username', 'email', 'role', 'profile'] # Profile is now read-only


    # READ: Use the existing get_profile logic for reading the data (GET request)
    def get_profile(self, obj):
        # NOTE: You must ensure your existing UserDetailSerializer logic is compatible
        # This will be used to send the profile data back to the frontend
        if obj.role == 'doctor':
            profile = DoctorProfile.objects.get(user=obj)
            # Use the full DoctorProfileSerializer to include all read-only fields
            return DoctorProfileSerializer(profile).data
        # ... (add logic for Counselor and Patient, using their full serializers)
        if obj.role == 'counselor':
             # ... (return full CounselorProfileSerializer)
             profile = CounselorProfile.objects.get(user=obj)
             return CounselorProfileSerializer(profile).data
        if obj.role == 'user':
             # ... (return full PatientProfileSerializer)
             profile = PatientProfile.objects.get(user=obj)
             return PatientProfileSerializer(profile).data
        return None

    def update(self, instance, validated_data):
        # 1. Pop and Prepare Nested Profile Data BEFORE super().update()
        profile_update_data = {}
        for role_key in ['doctor_profile_update', 'counselor_profile_update', 'patient_profile_update']:
            if role_key in validated_data:
                profile_update_data[role_key] = validated_data.pop(role_key)

        # 2. Update top-level User fields (Now 'validated_data' is safe)
        instance = super().update(instance, validated_data)

        # 3. Handle the nested profile update using the popped data
        profile_data_field_name = f'{instance.role}_profile_update'

        if profile_data_field_name in profile_update_data:
            profile_validated_data = profile_update_data[profile_data_field_name]

            # Get the correct Profile instance (e.g., instance.doctorprofile)
            try:
                profile_instance = getattr(instance, f'{instance.role}profile')
            except AttributeError:
                raise serializers.ValidationError({"detail": f"Profile instance not found for user role: {instance.role}."})

            # 4. Get the correct Profile Serializer and validate/save
            if instance.role == 'doctor':
                profile_serializer = DoctorProfileUpdateSerializer(instance=profile_instance, data=profile_validated_data, partial=True)
            elif instance.role == 'counselor':
                profile_serializer = CounselorProfileUpdateSerializer(instance=profile_instance, data=profile_validated_data, partial=True)
            elif instance.role == 'user':
                profile_serializer = PatientProfileUpdateSerializer(instance=profile_instance, data=profile_validated_data, partial=True)
            else:
                return instance

            profile_serializer.is_valid(raise_exception=True)
            profile_serializer.save()
            # print("--- DEBUG: Nested Profile SAVE Successful ---")

        return instance

class ProviderListSerializer(serializers.ModelSerializer):
    """
    A serializer to list doctors and counselors with their profiles for patients to view.
    """
    profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'role', 'profile']

    def get_profile(self, obj):
        if obj.role == 'doctor' and hasattr(obj, 'doctorprofile'):
            return DoctorProfileSerializer(obj.doctorprofile).data
        if obj.role == 'counselor' and hasattr(obj, 'counselorprofile'):
            return CounselorProfileSerializer(obj.counselorprofile).data
        if obj.role == 'user' and hasattr(obj, 'patientprofile'):
            return PatientProfileSerializer(obj.patientprofile).data
        return None


# Provider Schedule serializer

class ProviderScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderSchedule
        fields = ['id', 'day_of_week', 'start_time', 'end_time']


class UserInfoSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    nic = serializers.SerializerMethodField()
    email = serializers.EmailField(read_only=True) # Get email from User model
    contact_number = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'nic', 'contact_number'] # Updated fields

    def get_full_name(self, obj):
        # Safely access profile attributes
        profile = None
        if obj.role == 'user' and hasattr(obj, 'patientprofile'):
            profile = obj.patientprofile
        elif obj.role == 'doctor' and hasattr(obj, 'doctorprofile'):
            profile = obj.doctorprofile
        elif obj.role == 'counselor' and hasattr(obj, 'counselorprofile'):
            profile = obj.counselorprofile

        # Return full_name from profile if available, else User's name, else username
        return getattr(profile, 'full_name', None) or obj.get_full_name() or obj.username

    def get_nic(self, obj):
        profile = None
        if obj.role == 'user' and hasattr(obj, 'patientprofile'):
            profile = obj.patientprofile
        elif obj.role == 'doctor' and hasattr(obj, 'doctorprofile'):
            profile = obj.doctorprofile
        elif obj.role == 'counselor' and hasattr(obj, 'counselorprofile'):
            profile = obj.counselorprofile
        return getattr(profile, 'nic', None) # Return None if not found

    def get_contact_number(self, obj):
        profile = None
        if obj.role == 'user' and hasattr(obj, 'patientprofile'):
            profile = obj.patientprofile
        elif obj.role == 'doctor' and hasattr(obj, 'doctorprofile'):
            profile = obj.doctorprofile
        elif obj.role == 'counselor' and hasattr(obj, 'counselorprofile'):
            profile = obj.counselorprofile
        return getattr(profile, 'contact_number', None) # Return None if not found


# --- NEW: PatientDetailSerializer (For Patient Detail Page) ---
class PatientDetailSerializer(serializers.ModelSerializer):
    # Nest the profile directly
    patientprofile = PatientProfileSerializer(read_only=True)

    # Optional: Add related data (limit results for performance)
    # Customize AppointmentSerializer/PrescriptionSerializer if needed for this view
    #recent_appointments = AppointmentReadSerializer(many=True, read_only=True, source='patient_appointments') # Use related_name
    #recent_prescriptions = PrescriptionSerializer(many=True, read_only=True, source='prescriptions_as_patient') # Use related_name

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'date_joined', 'is_active', 'role', # Include role for safety
            'patientprofile',
             #'recent_appointments', # Uncomment if adding related data
             #'recent_prescriptions',
        ]
        read_only_fields = fields # Make all fields read-only for this detail view

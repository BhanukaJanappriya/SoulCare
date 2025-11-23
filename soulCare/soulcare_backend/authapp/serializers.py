from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User,PatientProfile,DoctorProfile,CounselorProfile,ProviderSchedule 
import pyotp
#from appointments.serializers import AppointmentReadSerializer
#from prescriptions.serializers import PrescriptionSerializer

class UserSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()
    profile_visibility = serializers.CharField(source='settings.profile_visibility', default='public')
    show_online_status = serializers.BooleanField(source='settings.show_online_status', default=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role', 'is_verified', 
            'profile', 'profile_visibility', 'show_online_status'
        ]

    def get_profile(self, obj):
        if obj.role == 'doctor' and hasattr(obj, 'doctorprofile'):
            return DoctorProfileSerializer(obj.doctorprofile).data
        elif obj.role == 'counselor' and hasattr(obj, 'counselorprofile'):
            return CounselorProfileSerializer(obj.counselorprofile).data
        elif obj.role == 'user' and hasattr(obj, 'patientprofile'):
            return PatientProfileSerializer(obj.patientprofile).data
        return None

def validate_nic_uniqueness(nic_value):
    """
    Checks if an NIC already exists in ANY profile.
    """
    if PatientProfile.objects.filter(nic=nic_value).exists():
        return False
    if DoctorProfile.objects.filter(nic=nic_value).exists():
        return False
    if CounselorProfile.objects.filter(nic=nic_value).exists():
        return False
    return True

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
        
#         # We check if the 'settings' relation exists and if 2FA is enabled
#         if hasattr(user, 'settings') and user.settings.two_factor_enabled:
#             otp_code = data.get('otp')

#             if not otp_code:
#                 # CASE A: 2FA is on, but no code provided.
#                 # Return a special flag to tell Frontend to ask for code.
#                 return {
#                     'requires_2fa': True,
#                     'message': 'Please enter your 6-digit 2FA code.'
#                 }
            
#             # CASE B: Code provided. Verify it.
#             totp = pyotp.TOTP(user.settings.two_factor_secret)
#             if not totp.verify(otp_code):
#                 raise serializers.ValidationError("Invalid or expired 2FA code.")

        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'role': user.role,
            'email': user.username,
            'requires_2fa': False
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
        
        
    def validate_nic(self, value):
        if not validate_nic_uniqueness(value):
            raise serializers.ValidationError("An account with this NIC card number already exists.")
        return value

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
    
    license_document = serializers.FileField(required=True, write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password','full_name','nic', 'contact_number','specialization','availability','license_number','license_document']
        
    
    def validate_nic(self, value):
        if not validate_nic_uniqueness(value):
            raise serializers.ValidationError("An account with this NIC card number already exists.")
        return value

    def create(self, validated_data):
        # Pop DoctorProfile-specific fields
        nic = validated_data.pop('nic')
        full_name = validated_data.pop('full_name')
        contact_number = validated_data.pop('contact_number')
        specialization = validated_data.pop('specialization')
        availability = validated_data.pop('availability')
        license_number = validated_data.pop('license_number')
        license_document = validated_data.pop('license_document')

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
            license_document=license_document,
        )

        return user

class CounselorRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    full_name = serializers.CharField()
    nic = serializers.CharField()
    expertise = serializers.CharField()
    contact_number = serializers.CharField()
    license_number = serializers.CharField()
    
    license_document = serializers.FileField(required=True, write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password','full_name','nic', 'expertise', 'contact_number','license_number','license_document']
        
    def validate_nic(self, value):
        if not validate_nic_uniqueness(value):
            raise serializers.ValidationError("An account with this NIC card number already exists.")
        return value

    def create(self, validated_data):
        # Pop CounselorProfile-specific fields
        nic = validated_data.pop('nic')
        full_name = validated_data.pop('full_name')
        expertise = validated_data.pop('expertise')
        contact_number = validated_data.pop('contact_number')
        license_number = validated_data.pop('license_number')
        license_document = validated_data.pop('license_document')

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
            license_document=license_document,

        )

        return user

class DoctorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorProfile
        fields = ['full_name', 'nic', 'contact_number', 'specialization', 'availability', 'license_number','rating','profile_picture', 'bio']


class CounselorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CounselorProfile
        fields = ['full_name', 'nic', 'contact_number', 'expertise', 'license_number','rating','profile_picture', 'bio']
        


class PatientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientProfile
        fields = ['full_name', 'nic', 'contact_number', 'address', 'dob', 'health_issues','profile_picture','risk_level']


class UserDetailSerializer(serializers.ModelSerializer):
    # This will dynamically serialize the profile based on the user's role
    profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'is_verified', 'profile']

    def get_profile(self, obj):
        if obj.role == 'doctor':
            profile = DoctorProfile.objects.get(user=obj)
            return DoctorProfileSerializer(profile,context=self.context).data
        if obj.role == 'counselor':
            profile = CounselorProfile.objects.get(user=obj)
            return CounselorProfileSerializer(profile,context=self.context).data
        if obj.role == 'user': # 'user' is the role for patients in your model
            profile = PatientProfile.objects.get(user=obj)
            return PatientProfileSerializer(profile,context=self.context).data
        return None




class AdminUserManagementSerializer(serializers.ModelSerializer):
    """
    Serializer for the Admin UI.
    Dynamically gets the full_name from the correct related profile based on the user's role.
    """
    # Use a SerializerMethodField to implement custom logic for getting the full_name.
    full_name = serializers.SerializerMethodField()
    
    license_document_url = serializers.SerializerMethodField() 

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
            'date_joined',
            'license_document_url'
        ]
        # For security, make fields that shouldn't be changed in this view read-only.
        # The admin will update is_verified and is_active via PATCH requests.
        read_only_fields = ['id', 'username', 'email', 'role', 'full_name', 'date_joined','license_document_url']

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
    
    def get_license_document_url(self, obj):
        # Return the URL of the license document if it exists
        try:
            if obj.role == 'doctor' and hasattr(obj, 'doctorprofile') and obj.doctorprofile.license_document:
                return obj.doctorprofile.license_document.url
            if obj.role == 'counselor' and hasattr(obj, 'counselorprofile') and obj.counselorprofile.license_document:
                return obj.counselorprofile.license_document.url
        except Exception:
            pass
        return None


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

    # --- DEFINE FLAT WRITABLE FIELDS ---
    # These allow the frontend to send data like 'bio', 'full_name', etc. directly
    full_name = serializers.CharField(write_only=True, required=False)
    contact_number = serializers.CharField(write_only=True, required=False)
    bio = serializers.CharField(write_only=True, required=False, allow_blank=True)
    profile_picture = serializers.ImageField(write_only=True, required=False)
    
    # Role-specific fields
    specialization = serializers.CharField(write_only=True, required=False)
    expertise = serializers.CharField(write_only=True, required=False)
    address = serializers.CharField(write_only=True, required=False)
    health_issues = serializers.CharField(write_only=True, required=False)
    # Note: We typically don't allow updating NIC via profile edit for security, 
    # but you can add it if needed.

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role', 'profile',
            # Include all the writable fields defined above
            'full_name', 'contact_number', 'bio', 'profile_picture',
            'specialization', 'expertise', 'address', 'health_issues'
        ]
        read_only_fields = ['id', 'username', 'email', 'role', 'profile']

    # READ: Use the existing get_profile logic (No change here)
    def get_profile(self, obj):
        if obj.role == 'doctor' and hasattr(obj, 'doctorprofile'):
            return DoctorProfileSerializer(obj.doctorprofile,context=self.context).data
        if obj.role == 'counselor' and hasattr(obj, 'counselorprofile'):
            return CounselorProfileSerializer(obj.counselorprofile,context=self.context).data
        if obj.role == 'user' and hasattr(obj, 'patientprofile'):
            return PatientProfileSerializer(obj.patientprofile,context=self.context).data
        return None

    # WRITE: Custom update method to handle the profile fields
    def update(self, instance, validated_data):
        # 1. Update User fields (if any are editable in the future)
        # For now, we just pass. 
        # If you wanted to allow email updates, you'd pop it here.
        
        # 2. Identify the correct profile instance
        profile = None
        if instance.role == 'doctor':
            profile = instance.doctorprofile
        elif instance.role == 'counselor':
            profile = instance.counselorprofile
        elif instance.role == 'user':
            profile = instance.patientprofile
        
        # 3. Update the profile instance with data from validated_data
        if profile:
            # List of all possible profile fields we accept
            profile_fields = [
                'full_name', 'contact_number', 'bio', 'profile_picture',
                'specialization', 'expertise', 'address', 'health_issues'
            ]
            
            for field in profile_fields:
                if field in validated_data:
                    setattr(profile, field, validated_data[field])
            
            profile.save()

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
            return DoctorProfileSerializer(obj.doctorprofile,context=self.context).data
        if obj.role == 'counselor' and hasattr(obj, 'counselorprofile'):
            return CounselorProfileSerializer(obj.counselorprofile,context=self.context).data
        if obj.role == 'user' and hasattr(obj, 'patientprofile'):
            return PatientProfileSerializer(obj.patientprofile,context=self.context).data
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
    risk_level = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'nic', 'contact_number','role','is_active','risk_level'] # Updated fields

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
    
    def get_risk_level(self, obj):
        if obj.role == 'user' and hasattr(obj, 'patientprofile'):
            return obj.patientprofile.risk_level
        return 'low' # Default for non-patients or missing profiles



# --- NEW: PatientDetailSerializer (For Patient Detail Page) ---
class PatientDetailSerializer(serializers.ModelSerializer):
    # Nest the profile directly
    patientprofile = PatientProfileSerializer()

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
        
    
    def update(self, instance, validated_data):
        profile_data = validated_data.pop('patientprofile', None)
        
        # Update User fields (if any, though we made them read_only above)
        instance = super().update(instance, validated_data)

        # Update Nested Profile fields
        if profile_data:
            profile = instance.patientprofile
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
            
        return instance

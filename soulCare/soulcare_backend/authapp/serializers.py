from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User,PatientProfile,DoctorProfile,CounselorProfile

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
        fields = ['full_name', 'nic', 'contact_number', 'specialization', 'availability', 'license_number']  


class CounselorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CounselorProfile
        fields = ['full_name', 'nic', 'contact_number', 'expertise', 'license_number']

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
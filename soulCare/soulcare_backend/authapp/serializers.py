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
            role='user'
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

    class Meta:
        model = User
        fields = ['username', 'email', 'password','full_name','nic', 'contact_number','specialization','availability']

    def create(self, validated_data):
        # Pop DoctorProfile-specific fields
        nic = validated_data.pop('nic')
        full_name = validated_data.pop('full_name')
        contact_number = validated_data.pop('contact_number')
        specialization = validated_data.pop('specialization')
        availability = validated_data.pop('availability')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role='doctor'
        )

        DoctorProfile.objects.create(
            user=user,
            full_name=full_name,
            nic=nic,
            specialization=specialization,
            contact_number=contact_number,
            availability=availability,
        )

        return user

class CounselorRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    full_name = serializers.CharField()
    nic = serializers.CharField()
    expertise = serializers.CharField()
    contact_number = serializers.CharField()

    class Meta:
        model = User
        fields = ['username', 'email', 'password','full_name','nic', 'expertise', 'contact_number']

    def create(self, validated_data):
        # Pop CounselorProfile-specific fields
        nic = validated_data.pop('nic') 
        full_name = validated_data.pop('full_name')
        expertise = validated_data.pop('expertise')
        contact_number = validated_data.pop('contact_number')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role='counselor'
        )
        
        CounselorProfile.objects.create(
            user=user,
            full_name = full_name,
            nic = nic,
            expertise=expertise,
            contact_number=contact_number,
        )

        return user
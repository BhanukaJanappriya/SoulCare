from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import LoginSerializer,PatientRegistrationSerializer, DoctorRegistrationSerializer, CounselorRegistrationSerializer,UserDetailSerializer,AdminUserManagementSerializer,ProviderListSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics

from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from .models import User
from django.db.models import Count, Q



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
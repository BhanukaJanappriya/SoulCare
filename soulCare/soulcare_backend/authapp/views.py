from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import LoginSerializer,PatientRegistrationSerializer, DoctorRegistrationSerializer, CounselorRegistrationSerializer
from rest_framework import generics


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
                "contact_number": user.doctorprofile.contact_number,
                "specialization": user.doctorprofile.specialization,
                "availability":user.doctorprofile.availability,
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
                "contact_number": user.counselorprofile.contact_number,
                "expertise": user.counselorprofile.expertise, 
            }
        }
        return Response(response_data,status=status.HTTP_201_CREATED)
    
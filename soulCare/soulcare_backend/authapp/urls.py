from django.urls import path
from .views import CounselorRegisterView, DoctorRegisterView, LoginView, PatientRegisterView,UserDetailView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('register/patient/', PatientRegisterView.as_view(), name='patient-register'),
    path('register/doctor/', DoctorRegisterView.as_view(), name='doctor-register'),
    path('register/counselor/', CounselorRegisterView.as_view(), name='counselor-register'),
    path('user/', UserDetailView.as_view(), name='user-detail'),
]

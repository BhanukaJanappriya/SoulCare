from django.urls import path,include
from .views import CounselorRegisterView, DoctorRegisterView, LoginView, PatientRegisterView,UserDetailView,AdminUserViewSet,AdminDashboardStatsView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('manage-users', AdminUserViewSet, basename='admin-manage-users')


urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('register/patient/', PatientRegisterView.as_view(), name='patient-register'),
    path('register/doctor/', DoctorRegisterView.as_view(), name='doctor-register'),
    path('register/counselor/', CounselorRegisterView.as_view(), name='counselor-register'),
    path('user/', UserDetailView.as_view(), name='user-detail'),
    path('admin/', include(router.urls)),
    path('admin/dashboard-stats/', AdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),
]

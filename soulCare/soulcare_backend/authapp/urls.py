from django.urls import path,include
from .views import CounselorRegisterView, DoctorRegisterView, LoginView, PatientRegisterView,UserDetailView,AdminUserViewSet,AdminDashboardStatsView,ProviderListView,ProviderScheduleViewSet,ProviderAvailabilityView,ProviderDetailView,DoctorPatientsView,PatientDetailView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('manage-users', AdminUserViewSet, basename='admin-manage-users')
router.register('schedules', ProviderScheduleViewSet,basename='provider-schedule')


urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('register/patient/', PatientRegisterView.as_view(), name='patient-register'),
    path('register/doctor/', DoctorRegisterView.as_view(), name='doctor-register'),
    path('register/counselor/', CounselorRegisterView.as_view(), name='counselor-register'),
    path('user/', UserDetailView.as_view(), name='user-detail'),
    path('admin/', include(router.urls)),
    path('admin/dashboard-stats/', AdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),
    path('providers/', ProviderListView.as_view(), name='provider-list'),
    
    path('providers/<int:provider_id>/availability/', ProviderAvailabilityView.as_view(), name='provider-availability'),
    
    path('', include(router.urls)),
    
    path('providers/<int:pk>/', ProviderDetailView.as_view(), name='provider-detail'),
    
    path('doctors/my-patients/', DoctorPatientsView.as_view(), name='doctor-patients-list'), #for prescription patient dropdown menu
    
    path('patients/<int:pk>/', PatientDetailView.as_view(), name='patient-detail'),
]


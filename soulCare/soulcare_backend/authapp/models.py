from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('doctor', 'Doctor'),
        ('counselor', 'Counselor'),
        ('admin', 'Admin'),
    ]

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    is_verified = models.BooleanField(default=False)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username

class PatientProfile(models.Model):
    user = models.OneToOneField('User', on_delete=models.CASCADE)
    full_name = models.CharField(max_length=100)
    nic = models.CharField(max_length=12)
    contact_number = models.CharField(max_length=15)
    address = models.TextField()
    dob = models.DateField(null=True, blank=True)
    health_issues = models.TextField(blank=True, null=True)
    # Add other patient fields you need here

class DoctorProfile(models.Model):
    user = models.OneToOneField('User', on_delete=models.CASCADE)
    full_name = models.CharField(max_length=100)
    nic = models.CharField(max_length=12)
    contact_number = models.CharField(max_length=15)
    specialization = models.CharField(max_length=255)
    availability = models.CharField(max_length=255)
    license_number = models.CharField(max_length=100)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=5.0)
    profile_picture_url = models.URLField(max_length=500, blank=True, null=True)
    bio = models.TextField(blank=True, null=True, help_text="A professional bio or statement for patients to see.")
    # Add other doctor fields you need here

class CounselorProfile(models.Model):
    user = models.OneToOneField('User', on_delete=models.CASCADE)
    full_name = models.CharField(max_length=100)
    nic = models.CharField(max_length=12)
    contact_number = models.CharField(max_length=15)
    expertise = models.CharField(max_length=255)
    license_number = models.CharField(max_length=100)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=5.0)
    profile_picture_url = models.URLField(max_length=500, blank=True, null=True)
    bio = models.TextField(blank=True, null=True, help_text="A professional bio or statement for patients to see.")
    # Add other counselor fields you need here

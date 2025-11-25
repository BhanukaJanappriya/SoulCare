from django.contrib.auth.models import AbstractUser
from django.db import models

GENDER_CHOICES = [
    ('M', 'Male'),
    ('F', 'Female'),
    ('O', 'Other'),
    ('P', 'Prefer not to say'),
]

MARITAL_CHOICES = [
    ('S', 'Single/Never Married'),
    ('M', 'Married/Cohabiting'),
    ('D', 'Divorced/Separated'),
    ('W', 'Widowed'),
]

EMPLOYMENT_CHOICES = [
    ('E', 'Employed'),
    ('U', 'Unemployed/Seeking'),
    ('S', 'Student'),
    ('R', 'Retired'),
    ('H', 'Homemaker'),
]
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

# --- ADDED VISIBILITY CHOICES ---
# class VisibilityChoices(models.TextChoices):
#     PUBLIC = 'public', 'Public'
#     PATIENTS_ONLY = 'patients_only', 'Patients Only'
#     PRIVATE = 'private', 'Private'

class PatientProfile(models.Model):

    RISK_CHOICES = [
        ('low', 'Low Risk'),
        ('medium', 'Medium Risk'),
        ('high', 'High Risk'),
    ]

    user = models.OneToOneField('User', on_delete=models.CASCADE)
    full_name = models.CharField(max_length=100)
    nic = models.CharField(max_length=20, unique=True)
    contact_number = models.CharField(max_length=15)
    address = models.TextField()
    dob = models.DateField(null=True, blank=True)
    health_issues = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profiles/patients/', blank=True, null=True)

    risk_level = models.CharField(max_length=10, choices=RISK_CHOICES, default='low')
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, null=True, blank=True)
    marital_status = models.CharField(max_length=1, choices=MARITAL_CHOICES, null=True, blank=True)
    # 2. SOCIO-ECONOMIC CONTEXT
    employment_status = models.CharField(max_length=1, choices=EMPLOYMENT_CHOICES, null=True, blank=True)
    financial_stress_level = models.IntegerField(null=True, blank=True,
                                                help_text="Self-reported financial stress scale (1=Low, 5=High)")

    # 3. HEALTH & HISTORY CONTEXT
    chronic_illness = models.BooleanField(default=False)
    substance_use = models.BooleanField(default=False, help_text="History of significant substance/alcohol use.")
    mh_diagnosis_history = models.BooleanField(default=False, help_text="History of prior mental health diagnosis.")

    # 4. ASSESSMENT TRACKING (For the LLM result)
    latest_phq9_score = models.IntegerField(null=True, blank=True) # E.g., raw PHQ-9 score (0-27)
    risk_level = models.CharField(max_length=10, choices=RISK_CHOICES, default='low')
    last_assessment_date = models.DateTimeField(null=True, blank=True)

class DoctorProfile(models.Model):
    user = models.OneToOneField('User', on_delete=models.CASCADE)
    full_name = models.CharField(max_length=100)
    nic = models.CharField(max_length=20, unique=True)
    contact_number = models.CharField(max_length=15)
    specialization = models.CharField(max_length=255)
    availability = models.CharField(max_length=255)
    license_number = models.CharField(max_length=100)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=5.0)
    profile_picture_url = models.URLField(max_length=500, blank=True, null=True)
    bio = models.TextField(blank=True, null=True, help_text="A professional bio or statement for patients to see.")
    profile_picture = models.ImageField(upload_to='profiles/doctors/', blank=True, null=True)

    license_document = models.FileField(upload_to='licenses/doctors/', blank=True, null=True, help_text="Upload your medical license for verification.")

    # Add other doctor fields you need here
    # --- ADDED FIELD ---
    # profile_visibility = models.CharField(
    #     max_length=20,
    #     choices=VisibilityChoices.choices,
    #     default=VisibilityChoices.PUBLIC
    # )

class CounselorProfile(models.Model):
    user = models.OneToOneField('User', on_delete=models.CASCADE)
    full_name = models.CharField(max_length=100)
    nic = models.CharField(max_length=20, unique=True)
    contact_number = models.CharField(max_length=15)
    expertise = models.CharField(max_length=255)
    license_number = models.CharField(max_length=100)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=5.0)
    profile_picture_url = models.URLField(max_length=500, blank=True, null=True)
    bio = models.TextField(blank=True, null=True, help_text="A professional bio or statement for patients to see.")
    profile_picture = models.ImageField(upload_to='profiles/counselors/', blank=True, null=True)

    license_document = models.FileField(upload_to='licenses/counselors/', blank=True, null=True, help_text="Upload your counselor license for verification.")

    # Add other counselor fields you need here

    # --- ADDED FIELD ---
    # profile_visibility = models.CharField(
    #     max_length=20,
    #     choices=VisibilityChoices.choices,
    #     default=VisibilityChoices.PUBLIC
    # )

class ProviderSchedule(models.Model):
    DAY_CHOICES = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]

    provider = models.ForeignKey(User, on_delete=models.CASCADE, related_name='schedules')
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        unique_together = ('provider', 'day_of_week', 'start_time', 'end_time')

    def __str__(self):
        return f"{self.provider.username}'s schedule for {self.get_day_of_week_display()}"

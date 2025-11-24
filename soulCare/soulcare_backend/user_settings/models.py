from django.db import models
from authapp.models import User

class UserSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='settings')

    # --- Preferences ---
     # --- Application Preferences ---
    
    # Theme Options
    THEME_CHOICES = [
        ('light', 'Light'),
        ('dark', 'Dark'),
    ]
    theme = models.CharField(max_length=10, default='light', choices=THEME_CHOICES)

    # Language Options
    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('es', 'Spanish'),
        ('fr', 'French'),
        ('de', 'German'),
    ]
    language = models.CharField(max_length=5, default='en', choices=LANGUAGE_CHOICES)

    # Timezone Options (Simplified list based on your UI)
    TIMEZONE_CHOICES = [
        ('UTC-5', 'EST (UTC-5)'),
        ('UTC-6', 'CST (UTC-6)'),
        ('UTC-7', 'MST (UTC-7)'),
        ('UTC-8', 'PST (UTC-8)'),
    ]
    timezone = models.CharField(max_length=10, default='UTC-5', choices=TIMEZONE_CHOICES)

    # Date Format Options
    DATE_FORMAT_CHOICES = [
        ('MM/DD/YYYY', 'MM/DD/YYYY'),
        ('DD/MM/YYYY', 'DD/MM/YYYY'),
        ('YYYY-MM-DD', 'YYYY-MM-DD'),
    ]
    date_format = models.CharField(max_length=20, default='MM/DD/YYYY', choices=DATE_FORMAT_CHOICES)

    # Time Format Options
    TIME_FORMAT_CHOICES = [
        ('12h', '12 Hour'),
        ('24h', '24 Hour'),
    ]
    time_format = models.CharField(max_length=5, default='12h', choices=TIME_FORMAT_CHOICES)


    VISIBILITY_CHOICES = [
        ('public', 'Public'),
        ('private', 'Private'),
        ('patients_only', 'Patients Only'),
    ]
    
    # We use CharField to store the specific choice
    profile_visibility = models.CharField(
        max_length=20, 
        default='public', 
        choices=VISIBILITY_CHOICES
    )

    show_online_status = models.BooleanField(default=True)

    # --- Two-Factor Authentication ---
    two_factor_enabled = models.BooleanField(default=False)
    two_factor_secret = models.CharField(max_length=32, blank=True, null=True)

    # --- Billing ---
    stripe_customer_id = models.CharField(max_length=50, blank=True, null=True)
    card_brand = models.CharField(max_length=20, blank=True, null=True)
    card_last4 = models.CharField(max_length=4, blank=True, null=True)


    def __str__(self):
        return f"Settings for {self.user.username}"
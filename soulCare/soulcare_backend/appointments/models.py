from django.db import models
from django.conf import settings
from datetime import datetime, time # NEW: Import datetime and time

class Appointment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    patient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='patient_appointments')
    provider = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='provider_appointments')

    date = models.DateField()
    time = models.TimeField()

    # CRITICAL NEW FIELD
    start_time = models.DateTimeField(null=True, blank=True, db_index=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Appointment for {self.patient.username} with {self.provider.username} on {self.date}"

    # CRITICAL NEW METHOD: Overwrite save to auto-populate start_time
    def save(self, *args, **kwargs):
        # 1. Combine date and time to populate start_time
        if self.date and self.time:
            # Handle if self.time is already a time object or a string
            time_obj = self.time if isinstance(self.time, time) else datetime.strptime(str(self.time), '%H:%M:%S').time()

            self.start_time = datetime.combine(self.date, time_obj)

        super().save(*args, **kwargs)

import os
import sys
import django
from datetime import date, time, timedelta

# Set up Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'soulcare_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from appointments.models import Appointment

User = get_user_model()

def book_more_doctor0():
    print("--- Seeding More Bookings for doctor0 (Dr. Alistair Vance) ---")

    patient2 = User.objects.filter(username='patient2').first()
    patient3 = User.objects.filter(username='patient3').first()
    patient4 = User.objects.filter(username='patient4').first()
    patient5 = User.objects.filter(username='patient5').first()
    doctor0 = User.objects.filter(username='doctor0').first()

    if not all([patient2, patient3, patient4, patient5, doctor0]):
        print("Error: Missing database accounts.")
        return

    # List of appointments for doctor0
    new_appts = [
        # patient2
        (patient2, date.today() - timedelta(days=8), time(10, 0), 'completed', 'Completed initial intake consultation. Discussed study-related burnout.'),
        (patient2, date.today() + timedelta(days=14), time(10, 0), 'pending', 'Booking request: Bi-weekly exam stress strategy review.'),
        
        # patient3
        (patient3, date.today() - timedelta(days=6), time(15, 0), 'completed', 'Completed behavioral progress tracking. Sleep hygiene homework evaluated.'),
        
        # patient4
        (patient4, date.today() + timedelta(days=7), time(9, 0), 'scheduled', 'Scheduled anxiety monitoring and relaxation exercises.'),
        (patient4, date.today() + timedelta(days=15), time(14, 30), 'pending', 'Booking request: Follow-up check-in for coping mechanisms.'),
        
        # patient5
        (patient5, date.today() + timedelta(days=10), time(11, 0), 'pending', 'Booking request: Consultation on somatic triggers and mood patterns.'),
    ]

    count = 0
    for patient, day, hr, status, notes in new_appts:
        appt = Appointment.objects.create(
            patient=patient,
            provider=doctor0,
            date=day,
            time=hr,
            status=status,
            notes=notes
        )
        print(f"Created Appt ID: {appt.id} | Patient: {patient.username} | Status: {appt.status} | Date: {appt.date}")
        count += 1

    print(f"\n--- Seeding completed. Added {count} new bookings for doctor0. ---")

if __name__ == "__main__":
    book_more_doctor0()

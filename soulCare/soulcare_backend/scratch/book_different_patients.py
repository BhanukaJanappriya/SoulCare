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

def book_different_patients():
    print("--- Seeding Appointments from Different Patients ---")

    patient2 = User.objects.filter(username='patient2').first()
    patient3 = User.objects.filter(username='patient3').first()
    patient4 = User.objects.filter(username='patient4').first()
    patient5 = User.objects.filter(username='patient5').first()

    doctor0 = User.objects.filter(username='doctor0').first()
    counselor0 = User.objects.filter(username='counselor0').first()

    if not all([patient2, patient3, patient4, patient5, doctor0, counselor0]):
        print("Error: One or more users not found in database.")
        return

    # List of appointments for different patients
    new_appts = [
        # patient2 (Jane Watson)
        (patient2, doctor0, date.today() + timedelta(days=3), time(10, 30), 'scheduled', 'Therapy session for academic and exam anxiety management.'),
        (patient2, counselor0, date.today() - timedelta(days=2), time(15, 0), 'completed', 'Completed check-in regarding stress levels and focus strategies.'),
        
        # patient3
        (patient3, doctor0, date.today() + timedelta(days=4), time(11, 0), 'pending', 'Booking request: Consultation regarding persistent low mood patterns.'),
        (patient3, counselor0, date.today() + timedelta(days=8), time(11, 30), 'pending', 'Booking request: Mindful focus session query.'),
        
        # patient4
        (patient4, doctor0, date.today() - timedelta(days=4), time(9, 30), 'completed', 'Standard monthly check-in for anxiety management tracking.'),
        
        # patient5
        (patient5, counselor0, date.today() + timedelta(days=6), time(14, 0), 'scheduled', 'Deep breathing session check and box breathing assessment.'),
    ]

    count = 0
    for patient, provider, day, hr, status, notes in new_appts:
        appt = Appointment.objects.create(
            patient=patient,
            provider=provider,
            date=day,
            time=hr,
            status=status,
            notes=notes
        )
        print(f"Created Appt ID: {appt.id} | Patient: {patient.username} | Provider: {provider.username} | Status: {appt.status}")
        count += 1

    print(f"\n--- Seeding completed. Added {count} appointments for different patients. ---")

if __name__ == "__main__":
    book_different_patients()

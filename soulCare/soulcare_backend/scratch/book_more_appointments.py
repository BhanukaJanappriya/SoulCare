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

def book_appointments():
    print("--- Seeding 6 Additional Appointments between patient0 and doctor0 ---")

    patient0 = User.objects.filter(username='patient0').first()
    doctor0 = User.objects.filter(username='doctor0').first()

    if not patient0 or not doctor0:
        print("Error: patient0 or doctor0 not found in database.")
        return

    # List of new appointments to add
    new_appts = [
        # Past Completed
        (date.today() - timedelta(days=10), time(9, 0), 'completed', 'Initial discussion about anxiety patterns and physical symptoms.'),
        (date.today() - timedelta(days=7), time(11, 30), 'completed', 'Discussed cognitive distortions and negative self-talk. Homework assigned.'),
        (date.today() - timedelta(days=5), time(14, 0), 'completed', 'Progress check. Patient reporting slight improvement in daytime mindfulness.'),
        
        # Future Scheduled/Pending
        (date.today() + timedelta(days=5), time(10, 0), 'scheduled', 'Weekly routine follow-up session. Reviewing journal logs.'),
        (date.today() + timedelta(days=9), time(16, 15), 'pending', 'Booking request: Discussion on somatic stress-release triggers.'),
        (date.today() + timedelta(days=12), time(13, 0), 'pending', 'Booking request: Monthly check-in and coping mechanism refinement.'),
    ]

    count = 0
    for day, hr, status, notes in new_appts:
        appt = Appointment.objects.create(
            patient=patient0,
            provider=doctor0,
            date=day,
            time=hr,
            status=status,
            notes=notes
        )
        print(f"Created Appointment ID: {appt.id} | Date: {appt.date} | Time: {appt.time} | Status: {appt.status}")
        count += 1

    print(f"\n--- Seeding completed. Added {count} new appointments. ---")

if __name__ == "__main__":
    book_appointments()

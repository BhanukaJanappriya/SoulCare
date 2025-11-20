# soulcare_backend/authapp/utils.py

from django.core.mail import send_mail
from django.conf import settings
import threading

# We use threading to send emails in the background so the user request isn't slowed down
class EmailThread(threading.Thread):
    def __init__(self, subject, message, recipient_list):
        self.subject = subject
        self.message = message
        self.recipient_list = recipient_list
        threading.Thread.__init__(self)

    def run(self):
        send_mail(
            self.subject,
            self.message,
            settings.DEFAULT_FROM_EMAIL,
            self.recipient_list,
            fail_silently=False,
        )

def send_notification_email(subject, message, recipient_list):
    """
    Helper function to trigger the email thread.
    """
    EmailThread(subject, message, recipient_list).start()

# --- SPECIFIC EMAIL SCENARIOS ---

def send_account_pending_email(user):
    subject = "SoulCare - Account Pending Verification"
    message = f"""
    Hello {user.username},

    Thank you for registering with SoulCare!

    Your account has been created successfully and is currently PENDING VERIFICATION.
    Our admin team will review your credentials. You will receive another email once your account is verified.

    Best regards,
    The SoulCare Team
    """
    send_notification_email(subject, message, [user.email])

def send_account_verified_email(user):
    subject = "SoulCare - Account Verified!"
    message = f"""
    Hello {user.username},

    Great news! Your SoulCare account has been VERIFIED.
    
    You can now log in to your dashboard, set your schedule, and start accepting appointments.

    Login here: http://localhost:5173/auth/login

    Best regards,
    The SoulCare Team
    """
    send_notification_email(subject, message, [user.email])



def send_appointment_approved_email(appointment):
    patient = appointment.patient
    provider = appointment.provider
    
  
    # The User model doesn't have a generic 'profile' attribute.
    # We must check the role to find the correct profile.
    provider_name = provider.username # Fallback
    
    try:
        if provider.role == 'doctor' and hasattr(provider, 'doctorprofile'):
            provider_name = provider.doctorprofile.full_name
        elif provider.role == 'counselor' and hasattr(provider, 'counselorprofile'):
            provider_name = provider.counselorprofile.full_name
    except Exception:
        pass # Keep using username if profile access fails
  

    subject = "SoulCare - Appointment Confirmed"
    message = f"""
    Hello {patient.username},

    Your appointment request has been CONFIRMED.

    Provider: {provider_name}
    Date: {appointment.date}
    Time: {appointment.time}

    Please be ready 5 minutes before your scheduled time.

    Best regards,
    The SoulCare Team
    """
    send_notification_email(subject, message, [patient.email])
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
    
    provider_type = 'Provider'
    
    try:
        if provider.role == 'doctor' and hasattr(provider, 'doctorprofile'):
            provider_name = provider.doctorprofile.full_name
            provider_type = 'Doctor'
        elif provider.role == 'counselor' and hasattr(provider, 'counselorprofile'):
            provider_name = provider.counselorprofile.full_name
            provider_type = 'Counselor'
    except Exception:
        pass # Keep using username if profile access fails
  

    subject = "SoulCare - Appointment Confirmed"
    message = f"""
    Hello {patient.patientprofile.full_name},

    Your appointment request has been CONFIRMED.

    {provider_type}: {provider_name}
    Date: {appointment.date}
    Time: {appointment.time}

    Please be ready 5 minutes before your scheduled time.

    Best regards,
    The SoulCare Team
    """
    send_notification_email(subject, message, [patient.email])
    

def send_appointment_cancelled_email(appointment, cancelled_by_role):
    patient = appointment.patient
    provider = appointment.provider
    
    provider_name = provider.username
    try:
        if provider.role == 'doctor' and hasattr(provider, 'doctorprofile'):
            provider_name = provider.doctorprofile.full_name
        elif provider.role == 'counselor' and hasattr(provider, 'counselorprofile'):
            provider_name = provider.counselorprofile.full_name
    except Exception:
        pass

    patient_name = patient.username
    try:
        if hasattr(patient, 'patientprofile'):
             patient_name = patient.patientprofile.full_name
    except Exception:
        pass

    if cancelled_by_role == 'patient':
        recipient = [provider.email]
        subject = "SoulCare - Appointment Cancelled by Patient"
        message = f"""
        Hello {provider_name},
        The appointment with {patient_name} on {appointment.date} at {appointment.time} has been CANCELLED.
        """
    else:
        recipient = [patient.email]
        subject = "SoulCare - IMPORTANT: Appointment Cancelled"
        message = f"""
        Hello {patient_name},
        Your appointment with {provider_name} on {appointment.date} at {appointment.time} has been CANCELLED.
        """

    send_notification_email(subject, message, recipient)
    
    
def send_content_shared_email(content_item, patient):
    provider = content_item.owner
    provider_name = provider.username
    provider_type = 'Provider'
    
    try:
        if provider.role == 'doctor' and hasattr(provider, 'doctorprofile'):
            provider_name = provider.doctorprofile.full_name
            provider_type = 'Doctor'
            
        elif provider.role == 'counselor' and hasattr(provider, 'counselorprofile'):
            provider_name = provider.counselorprofile.full_name
            provider_type = 'Counselor'
            
    except Exception:
        pass
    
    subject = f"SoulCare - New Resource Shared: {content_item.title}"
    message = f"""
    Hello {patient.username},

    {provider_type}: {provider_name} has shared a new resource with you: "{content_item.title}".
    Log in to your dashboard to view it.

    Best regards,
    The SoulCare Team
    """
    send_notification_email(subject, message, [patient.email])
    

def send_blog_status_email(blog_post, status):
    """
    Sends an email to the blog author when their post is approved or rejected.
    """
    author = blog_post.author
    subject = ""
    message = ""

    if status == 'published':
        subject = "SoulCare - Your Blog Post is Live!"
        message = f"""
        Hello {author.username},

        Congratulations! Your blog post "{blog_post.title}" has been APPROVED and is now live on the SoulCare platform.

        Thank you for your contribution.

        Best regards,
        The SoulCare Team
        """
    elif status == 'rejected':
        subject = "SoulCare - Update on Your Blog Post"
        message = f"""
        Hello {author.username},

        We reviewed your blog post "{blog_post.title}". Unfortunately, it has been declined at this time.

        Please review our content guidelines and feel free to submit a new draft.

        Best regards,
        The SoulCare Team
        """
    
    if subject and message:
        send_notification_email(subject, message, [author.email])    
        
        
def send_patient_welcome_email(user):
    """
    Sends a welcome email to a newly registered patient.
    """
    subject = "Welcome to SoulCare! Your Journey Starts Here."
    
    # You can customize this message further with specific instructions
    message = f"""
    Hello {user.username},

    Welcome to the SoulCare family! We are honored to be part of your mental wellness journey.

    Your account has been successfully created. You can now log in to:
    - Browse our verified doctors and counselors.
    - Book appointments.
    - Take a Questionnaire to assess your Stress level 
    - Use our mood tracker and journaling tools.
    - Play Stress Reducing Games. 
    - Massage With Professionals.
    - Chat with our AI Companion.
    - Access personalized resources.
    

    Login here: http://localhost:5173/auth/login

    If you have any questions, our support team is here to help.

    Warm regards,
    The SoulCare Team
    """
    
    # Send to the user's email address
    send_notification_email(subject, message, [user.email])
    
    

# --- SCENARIO 8: Prescription Shared ---
def send_prescription_shared_email(prescription):
    patient = prescription.patient
    doctor = prescription.doctor
    
    # Safely get doctor name
    doctor_name = doctor.username
    try:
        if hasattr(doctor, 'doctorprofile'):
            doctor_name = doctor.doctorprofile.full_name
    except Exception:
        pass
    
    # Safely get patient name
    patient_name = patient.username
    try:
        if hasattr(patient, 'patientprofile'):
            patient_name = patient.patientprofile.full_name
    except Exception:
        pass

    subject = "SoulCare - New Prescription Received"
    message = f"""
    Hello {patient_name},

    Dr. {doctor_name} has issued a new prescription for you.

    Date Issued: {prescription.date_issued}
    Diagnosis: {prescription.diagnosis}

    Please log in to your Account to view the full details and medication list.

    Best regards,
    The SoulCare Team
    """
    send_notification_email(subject, message, [patient.email])
    
    
    
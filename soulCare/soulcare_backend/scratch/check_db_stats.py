import os
import sys
import django

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'soulcare_backend.settings')
django.setup()

from appointments.models import Appointment
from chat.models import Conversation, Message
from blog.models import BlogPost, BlogComment

print("--- DB STATS ---")
print(f"Total Appointments: {Appointment.objects.count()}")
print(f"Total Conversations: {Conversation.objects.count()}")
print(f"Total Messages: {Message.objects.count()}")
print(f"Total BlogPosts: {BlogPost.objects.count()}")

print("\nRecent Conversations:")
for conv in Conversation.objects.all()[:5]:
    print(f"ID: {conv.id}, Patient: {conv.patient.username}, Provider: {conv.provider.username}, Messages: {conv.messages.count()}")

print("\nRecent Appointments:")
for appt in Appointment.objects.all()[:5]:
    print(f"ID: {appt.id}, Patient: {appt.patient.username}, Provider: {appt.provider.username}, Date: {appt.date}, Time: {appt.time}, Status: {appt.status}")

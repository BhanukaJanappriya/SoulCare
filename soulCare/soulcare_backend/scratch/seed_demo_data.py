import os
import sys
import django
from datetime import date, time, timedelta

# Set up Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'soulcare_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from authapp.models import PatientProfile, DoctorProfile, CounselorProfile
from appointments.models import Appointment, ProgressNote
from chat.models import Conversation, Message
from blog.models import BlogPost, BlogComment
from feedback.models import Feedback
from prescriptions.models import Prescription, Medication
from reviews.models import Review
from content.models import ContentItem

User = get_user_model()

def seed_data():
    print("--- Starting Demo Data Seeding ---")

    # 1. Update/Ensure Password for All Users
    password = 'Gdr@1101'
    print("Updating passwords for all existing users to 'Gdr@1101'...")
    for user in User.objects.all():
        user.set_password(password)
        user.save()
        print(f"  Password updated for: {user.username} (Role: {user.role})")

    # Get handles on key users
    admin = User.objects.filter(role='admin').first()
    patient0 = User.objects.filter(username='patient0').first()
    patient2 = User.objects.filter(username='patient2').first()
    patient3 = User.objects.filter(username='patient3').first()
    doctor0 = User.objects.filter(username='doctor0').first()
    doctor2 = User.objects.filter(username='doctor2').first()
    counselor0 = User.objects.filter(username='counselor0').first()
    counselor1 = User.objects.filter(username='counselor1').first()

    # Ensure profiles exist and have realistic bios/specializations
    print("Seeding/updating user profiles...")
    if doctor0:
        DoctorProfile.objects.update_or_create(
            user=doctor0,
            defaults={
                'full_name': 'Dr. Alistair Vance',
                'nic': '891029312V',
                'contact_number': '+94771234567',
                'specialization': 'Cognitive Behavioral Therapy & Clinical Psychiatry',
                'availability': 'Mon-Fri 9AM - 5PM',
                'license_number': 'MC-90821',
                'rating': 4.8,
                'bio': 'Dr. Alistair Vance has over 12 years of experience specializing in anxiety, clinical depression, and trauma management. He employs data-driven cognitive approaches to help individuals regain stability and mental wellness.',
            }
        )
    
    if doctor2:
        DoctorProfile.objects.update_or_create(
            user=doctor2,
            defaults={
                'full_name': 'Dr. Sarah Jenkins',
                'nic': '920829312V',
                'contact_number': '+94772345678',
                'specialization': 'Neurodevelopmental & ADHD Support',
                'availability': 'Tue-Thu 10AM - 4PM',
                'license_number': 'MC-82103',
                'rating': 4.9,
                'bio': 'Dr. Sarah Jenkins works primarily with adolescents and young adults managing ADHD, mood disorders, and academic stress.',
            }
        )

    if counselor0:
        CounselorProfile.objects.update_or_create(
            user=counselor0,
            defaults={
                'full_name': 'Dr. Jimmy Hoffa (Counselor)',
                'nic': '771209341V',
                'contact_number': '+94773456789',
                'expertise': 'Stress Management, Mindfulness & Grief Support',
                'license_number': 'CO-77210',
                'rating': 4.7,
                'bio': 'Licensed mindfulness practitioner and grief counselor focusing on somatic healing, deep breathing, and emotional regulation practices.',
            }
        )
        
    if counselor1:
        CounselorProfile.objects.update_or_create(
            user=counselor1,
            defaults={
                'full_name': 'Counselor Gayan Ranagana',
                'nic': '831209341V',
                'contact_number': '+94774567890',
                'expertise': 'Occupational Burnout & Family Counseling',
                'license_number': 'CO-91022',
                'rating': 4.6,
                'bio': 'Expert in resolving career burnout, work-life balance struggles, and relationship dynamics.',
            }
        )

    if patient0:
        PatientProfile.objects.update_or_create(
            user=patient0,
            defaults={
                'full_name': 'John Doe',
                'nic': '980129341V',
                'contact_number': '+94775678901',
                'address': 'No. 15, Flower Road, Colombo 07',
                'dob': date(1998, 5, 12),
                'health_issues': 'Experiencing persistent sleep disturbances, mild workplace anxiety, and chronic fatigue.',
                'risk_level': 'medium',
                'latest_phq9_score': 12,
                'last_assessment_date': timezone.now() - timedelta(days=2),
            }
        )

    if patient2:
        PatientProfile.objects.update_or_create(
            user=patient2,
            defaults={
                'full_name': 'Jane Watson',
                'nic': '991229341V',
                'contact_number': '+94776789012',
                'address': '42 Baker St, Kandy',
                'dob': date(1999, 12, 1),
                'health_issues': 'Self-reported stress related to university exams.',
                'risk_level': 'low',
                'latest_phq9_score': 6,
                'last_assessment_date': timezone.now() - timedelta(days=5),
            }
        )

    print("Profiles seeded.")

    # 2. Seed Appointments with Different Statuses
    print("Seeding appointments...")
    # Clear existing to avoid duplicate conflicts
    Appointment.objects.all().delete()
    
    # 2.1 Completed Appointment (with doctor0)
    app1 = Appointment.objects.create(
        patient=patient0,
        provider=doctor0,
        date=date.today() - timedelta(days=3),
        time=time(10, 0),
        status='completed',
        notes='Initial consultation. Patient reported insomnia and high career stress. Discussed sleep hygiene practices.'
    )
    
    # 2.2 Scheduled Appointment (with doctor0) - Upcoming
    app2 = Appointment.objects.create(
        patient=patient0,
        provider=doctor0,
        date=date.today() + timedelta(days=2),
        time=time(14, 0),
        status='scheduled',
        notes='Follow-up check-in to review sleep tracker logs and adjustments to daily routine.'
    )

    # 2.3 Pending Appointment (with counselor0)
    app3 = Appointment.objects.create(
        patient=patient0,
        provider=counselor0,
        date=date.today() + timedelta(days=4),
        time=time(15, 30),
        status='pending',
        notes='Requesting a session on deep breathing exercises and somatic stress-relief strategies.'
    )

    # 2.4 Cancelled Appointment (with doctor2)
    app4 = Appointment.objects.create(
        patient=patient2,
        provider=doctor2,
        date=date.today() - timedelta(days=1),
        time=time(11, 0),
        status='cancelled',
        cancelled_by='patient',
        notes='Cancelled due to sudden timetable clash at university.'
    )

    print(f"Successfully seeded {Appointment.objects.count()} appointments.")

    # 3. Seed Progress Notes for patient0
    print("Seeding clinical progress notes...")
    ProgressNote.objects.all().delete()
    ProgressNote.objects.create(
        patient=patient0,
        provider=doctor0,
        content="Patient is showing proactive engagement with the sleep schedule adjustment. Daily caffeine intake has been cut in half. Insomnia symptoms are showing early signs of improvement. Recommended continuing the screen-free wind-down hour before bed."
    )

    # 4. Seed Reviews/Ratings for Appointments
    print("Seeding provider reviews...")
    Review.objects.all().delete()
    Review.objects.create(
        appointment=app1,
        patient=patient0,
        provider=doctor0,
        rating=5,
        comment="Dr. Vance was incredibly understanding and analytical. His sleep tips helped me fall asleep much faster within the first 3 days!"
    )

    # 5. Seed Conversations & Real-Time Chat Message History
    print("Seeding conversations and messages...")
    Conversation.objects.all().delete()
    Message.objects.all().delete()

    # Conv 1: patient0 & doctor0
    c1 = Conversation.objects.create(patient=patient0, provider=doctor0)
    messages_c1 = [
        (patient0, "Hello Dr. Vance, I wanted to follow up on the sleep guide you gave me. I have been trying to stick to it for the past two days."),
        (doctor0, "Hello John. Glad to hear you're starting. How has the routine felt? Are you finding it difficult to stay away from screens?"),
        (patient0, "Honestly, the first night was very hard. I kept reaching for my phone. But last night was better, and I slept about 6 hours straight."),
        (doctor0, "6 hours is an encouraging start! The brain takes time to readapt to low-stimulus environments before sleep. Keep the phone out of arm's reach."),
        (patient0, "I will try that tonight. Also, what should I do if I wake up at 3 AM and can't fall back asleep? That's my main struggle."),
        (doctor0, "Excellent question. If you are awake for more than 20 minutes, get out of bed. Go to a dimly lit room, read a physical book, or do light stretching. Do not turn on bright lights or look at screens. Only return to bed when you feel sleepy again."),
        (patient0, "Understood. That makes sense—don't let my brain associate the bed with lying awake frustrated. I'll practice this."),
        (doctor0, "Exactly. Your bed should only be associated with sleep. Keep me updated. We'll review your progress in detail in our next scheduled call on Wednesday."),
        (patient0, "Thank you, doctor. Have a great evening!"),
        (doctor0, "You're very welcome, John. Take care.")
    ]
    
    for sender, text in messages_c1:
        Message.objects.create(
            conversation=c1,
            sender=sender,
            content=text,
            timestamp=timezone.now() - timedelta(minutes=len(messages_c1) - messages_c1.index((sender, text)))
        )

    # Conv 2: patient0 & counselor0
    c2 = Conversation.objects.create(patient=patient0, provider=counselor0)
    messages_c2 = [
        (patient0, "Hi Dr. Hoffa, I've been feeling extremely overwhelmed at work today. My chest feels tight. Do you have any quick breathing exercises?"),
        (counselor0, "Hi John. Take a deep breath. Let's do Box Breathing right now. It is a simple but highly effective way to trigger the parasympathetic nervous system."),
        (patient0, "Okay, how do I do it?"),
        (counselor0, "1. Inhale slowly through your nose for 4 seconds.\n2. Hold your breath for 4 seconds.\n3. Exhale fully through your mouth for 4 seconds.\n4. Pause and hold empty for 4 seconds.\n\nRepeat this cycle 4 times. Let's try it now."),
        (patient0, "Just did 3 cycles. My heart rate is starting to slow down. I feel a bit more grounded."),
        (counselor0, "Beautiful. Box breathing is used by first responders to manage acute stress. Practice this whenever you feel your chest tightening. We will explore deep somatic relaxation during our session next week.")
    ]
    for sender, text in messages_c2:
        Message.objects.create(
            conversation=c2,
            sender=sender,
            content=text,
            timestamp=timezone.now() - timedelta(minutes=len(messages_c2) - messages_c2.index((sender, text)))
        )

    print(f"Seeded {Conversation.objects.count()} conversations with {Message.objects.count()} total messages.")

    # 6. Seed Prescriptions
    print("Seeding prescriptions...")
    Prescription.objects.all().delete()
    Medication.objects.all().delete()

    presc = Prescription.objects.create(
        patient=patient0,
        doctor=doctor0,
        diagnosis="Primary Insomnia secondary to Mild Generalized Anxiety Disorder (GAD)."
    )
    
    Medication.objects.create(
        prescription=presc,
        name="Melatonin Support Tablets",
        dosage="3mg",
        frequency="Once daily",
        instructions="Take 30-60 minutes before scheduled bedtime. Avoid heavy meals or screen use after consumption."
    )
    Medication.objects.create(
        prescription=presc,
        name="L-Theanine Supplement",
        dosage="200mg",
        frequency="Every morning",
        instructions="Take with water to promote daytime calm and alert focus without inducing drowsiness."
    )
    print("Prescriptions seeded.")

    # 7. Seed Blog Posts
    print("Seeding blog posts...")
    BlogPost.objects.all().delete()
    BlogComment.objects.all().delete()

    post1 = BlogPost.objects.create(
        author=doctor0,
        title="5 Scientific Strategies to Optimize Your Sleep Architecture",
        excerpt="Poor sleep quality exacerbates anxiety and depressive symptoms. Learn five evidence-based techniques to rebuild healthy sleep habits.",
        content="""Good sleep is not just about duration; it is about sleep architecture—the natural progression of deep, light, and REM sleep cycles. 

Here are five clinically-validated habits to improve sleep quality:
1. **Maintain a Strict Circadian Anchor:** Wake up at the exact same time every day, including weekends. This stabilizes your internal biological clock.
2. **First-Hour Sunlight Exposure:** Expose your eyes to outdoor sunlight for 10-15 minutes within an hour of waking to stop melatonin production.
3. **The 3-2-1 Rule:** Stop eating heavy meals 3 hours before bed, stop drinking water/fluids 2 hours before bed, and stop all screens 1 hour before bed.
4. **Cool Down Your Sanctuary:** Keep your bedroom temperature around 65°F (18°C). A drop in core body temperature is essential to signal sleep onset.
5. **Cognitive Brain Dump:** Write down tomorrow's to-do list or any pressing worries on a notepad before bed. This unloads the working memory, reducing pre-sleep rumination.

Try implementing these step-by-step and track your mood changes over a fortnight.
""",
        tags="sleep, mental health, cognitive hygiene, wellness",
        status='published',
        publishedAt=timezone.now() - timedelta(days=3)
    )

    post2 = BlogPost.objects.create(
        author=counselor0,
        title="Mindfulness in Motion: How to Meditate Without Sitting Still",
        excerpt="Struggling with standard silent meditation? Discover active mindfulness practices that fit seamlessly into a busy schedule.",
        content="""Many people abandon meditation because they find sitting silently in a chair incredibly frustrating. If this sounds like you, active mindfulness (or 'mindfulness in motion') might be your gateway to peace.

Active mindfulness is about directing your undivided attention to the sensory inputs of your current physical action. Here are three ways to practice:
1. **Somatic Walking:** Go for a walk without headphones. Focus on the physical sensation of your feet striking the ground, the temperature of the wind on your skin, and the sounds around you.
2. **Mindful Dishwashing:** Turn a routine chore into a grounding exercise. Feel the warmth of the water, the texture of the bubbles, and the motion of scrubbing.
3. **The 5-4-3-2-1 Grounding Method:** Look around your workspace and name:
   - 5 things you can see
   - 4 things you can physically feel
   - 3 things you can hear
   - 2 things you can smell
   - 1 thing you can taste

Mindfulness is a muscle. You do not need to be sitting on a cushion to train it. Start today with just 2 minutes of focused sensory attention.
""",
        tags="mindfulness, meditation, stress relief, somatic healing",
        status='published',
        publishedAt=timezone.now() - timedelta(days=1)
    )

    post3 = BlogPost.objects.create(
        author=counselor1,
        title="Overcoming Professional Burnout: A Practical Action Plan",
        excerpt="Burnout is not just exhaustion—it is a clinical response to chronic stressors. Learn how to recognize and address it.",
        content="""Professional burnout is recognized by the WHO as an occupational phenomenon characterized by exhaustion, feelings of cynicism, and reduced professional efficacy.

If you suspect you are burnt out, take these immediate steps:
1. **Schedule Non-Negotiable Recovery Time:** Dedicate at least one evening or weekend block entirely to activities that restore your energy, without check-ins or work logs.
2. **Set Rigid Boundaries:** Close your email and communication channels at a fixed time each day. 
3. **Communicate with Stakeholders:** Open a discussion with your supervisor about task prioritization or workload sharing.

Taking a step back is not a sign of failure—it is a requirement for long-term clinical and personal sustainability.""",
        tags="burnout, career, stress management, self-care",
        status='pending'  # Set to pending so it shows in the Admin moderation queue!
    )

    # Comments on blogs
    BlogComment.objects.create(
        post=post1,
        author=patient0,
        content="This 3-2-1 rule has changed my sleep completely. Sticking to the screen-free hour is tough but so rewarding."
    )
    BlogComment.objects.create(
        post=post1,
        author=counselor0,
        content="Excellent advice, Dr. Vance. I often recommend the cool room setting to my counseling clients; the physiological temperature drop is highly effective."
    )
    
    print(f"Seeded {BlogPost.objects.count()} blog posts.")

    # 8. Seed Feedbacks / Testimonials
    print("Seeding feedbacks...")
    Feedback.objects.all().delete()
    
    # Approved feedbacks (to appear on landing page)
    Feedback.objects.create(
        user=patient0,
        content="SoulCare completely transformed how I coordinate with my therapist. The appointment booking and secure chat system are seamless and private.",
        rating=5,
        is_approved=True
    )
    Feedback.objects.create(
        user=patient2,
        content="Being able to track my mood and complete stress assessments in one portal gives me a clear view of my mental progress.",
        rating=4,
        is_approved=True
    )
    
    # Pending feedback (to appear in Admin testimonial moderation queue!)
    Feedback.objects.create(
        user=patient3,
        content="The mindfulness resources on this platform are incredible. The UI feels incredibly calming and premium.",
        rating=5,
        is_approved=False
    )
    print("Feedbacks seeded.")

    # 9. Seed Content Library Items
    print("Seeding content library items...")
    ContentItem.objects.all().delete()
    
    # We create mock content items (files don't need to actually exist or we can write empty text placeholder files)
    media_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'media', 'content_files')
    os.makedirs(media_dir, exist_ok=True)
    
    placeholder_file = os.path.join(media_dir, 'insomnia_guide.pdf')
    with open(placeholder_file, 'w') as f:
        f.write("Insomnia Sleep Guide PDF Placeholder")

    # Item 1: Public Document
    item1 = ContentItem.objects.create(
        title="Clinically Proven Cognitive Sleep Therapy Exercises",
        description="A practical workbook containing progressive muscle relaxation techniques, sleep restriction schedules, and cognitive reframing sheets for chronic insomnia.",
        type="document",
        file="content_files/insomnia_guide.pdf",
        owner=doctor0,
        tags="insomnia, sleep hygiene, CBT-I, workbook"
    )
    
    # Item 2: Public Document
    item2 = ContentItem.objects.create(
        title="Mindful Breathing Guide: Box Breathing & Grounding",
        description="Printable worksheet detailing daily breathing rhythms, box breathing timings, and somatic grounding routines for acute panic or stress attacks.",
        type="document",
        file="content_files/insomnia_guide.pdf",
        owner=counselor0,
        tags="breathing, anxiety relief, box breathing, worksheet"
    )
    
    print("Content library items seeded.")

    print("\n--- Seeding Completed Successfully! ---")
    print("All accounts password set to: Gdr@1101")
    print("Existing roles: user (patient0, patient2...), doctor (doctor0, doctor2...), counselor (counselor0, counselor1...), admin (admin)")

if __name__ == "__main__":
    seed_data()

# soulcare_backend/assessments/management/commands/seed_assessment.py

from django.core.management.base import BaseCommand
from assessments.models import Questionnaire, Question
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Seeds the database with the initial Depression Assessment Questionnaire and Questions.'

    def handle(self, *args, **options):
        # 1. Check if the questionnaire already exists
        questionnaire_title = "Depression Assessment Test"
        if Questionnaire.objects.filter(title=questionnaire_title).exists():
            self.stdout.write(self.style.WARNING(f"Questionnaire '{questionnaire_title}' already exists. Skipping seed."))
            return

        # 2. Create the Questionnaire instance
        questionnaire = Questionnaire.objects.create(
            title=questionnaire_title,
            description="A 20-question self-assessment to check on your emotional well-being.",
            max_raw_score=80, # 20 questions * max score 4
            is_active=True
        )
        self.stdout.write(self.style.SUCCESS(f"Successfully created Questionnaire: {questionnaire_title}"))

        # 3. Define the 20 questions
        questions_data = [
            "I generally feel down and unhappy.",
            "I have less interest in other people than I used to.",
            "It takes a lot of effort to start working on something new.",
            "I don't get as much satisfaction out of things as I used to.",
            "I have headaches or back pain for no apparent reason.",
            "I easily get impatient, frustrated, or angry.",
            "I feel lonely, and that people aren't that interested in me.",
            "I feel like I have nothing to look forward to.",
            "I have episodes of crying that are hard to stop.",
            "I have trouble getting to sleep or I sleep in too late.",
            "I feel like my life has been a failure or a disappointment.",
            "I have trouble staying focused on what I'm supposed to be doing.",
            "I blame myself for my faults and mistakes.",
            "I feel like I've slowed down; sometimes I don't have the energy to get anything done.",
            "I have trouble finishing books, movies, or TV shows.",
            "I put off making decisions more often than I used to.",
            "When I feel down, friends and family can't cheer me up.",
            "I think about people being better off without me.",
            "I'm eating much less (or much more) than normal and it's affecting my weight.",
            "I have less interest in sex than I used to.",
        ]

        # 4. Create the Question instances
        question_objects = [
            Question(
                questionnaire=questionnaire,
                text=text,
                order=i + 1
            ) for i, text in enumerate(questions_data)
        ]
        Question.objects.bulk_create(question_objects)
        self.stdout.write(self.style.SUCCESS(f"Successfully created {len(question_objects)} questions."))

# soulcare_backend/assessments/views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Questionnaire, Question, AssessmentResult, DEPRESSION_LEVELS
from .serializers import (
    QuestionSerializer,
    AssessmentResponseInputSerializer,
    AssessmentResultSerializer
)
from .utils import calculate_scaled_score_and_level # We will create this utility

class AssessmentViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'submit_response':
            return AssessmentResponseInputSerializer
        elif self.action == 'latest_questions':
            return QuestionSerializer
        return AssessmentResultSerializer

    def get_queryset(self):
        # Only allow patients to view their own results
        if self.action == 'history':
            return AssessmentResult.objects.filter(patient=self.request.user)
        return AssessmentResult.objects.none()


    @action(detail=False, methods=['get'])
    def latest_questions(self, request):
        """Returns the questions for the current active questionnaire."""
        try:
            # Assumes the latest one is the active one, or you can filter by is_active=True
            latest_assessment = Questionnaire.objects.filter(is_active=True).latest('created_at')
        except Questionnaire.DoesNotExist:
            return Response({"detail": "No active assessment found."}, status=status.HTTP_404_NOT_FOUND)

        questions = latest_assessment.questions.all()
        serializer = self.get_serializer_class()(questions, many=True)
        return Response({
            'title': latest_assessment.title,
            'description': latest_assessment.description,
            'questions': serializer.data,
            # Pass the score info to the frontend for display
            'score_info': {
                'max_raw_score': latest_assessment.max_raw_score,
                'max_scaled_score': 100,
                'levels': [
                    {'level': level[0], 'range': level[1].split('(')[-1].strip(')')}
                    for level in DEPRESSION_LEVELS
                ]
            }
        })

    @action(detail=False, methods=['post'])
    def submit_response(self, request):
        """Processes the patient's submitted responses, calculates score, and saves the result."""

        # 1. Validate the input structure (list of {question_id, score})
        serializer = self.get_serializer_class()(data=request.data.get('responses'), many=True)
        serializer.is_valid(raise_exception=True)

        # 2. Get the latest active questionnaire
        try:
            latest_assessment = Questionnaire.objects.filter(is_active=True).latest('created_at')
        except Questionnaire.DoesNotExist:
            return Response({"detail": "No active assessment found to submit a result against."}, status=status.HTTP_400_BAD_REQUEST)

        # 3. Calculate raw score
        raw_score = sum(item['score'] for item in serializer.validated_data)

        # 4. Calculate scaled score and determine the depression level/interpretation
        scaled_score, level, interpretation = calculate_scaled_score_and_level(raw_score)

        # 5. Create the AssessmentResult object
        result = AssessmentResult.objects.create(
            patient=request.user,
            questionnaire=latest_assessment,
            raw_score=raw_score,
            scaled_score=scaled_score,
            level=level,
            interpretation=interpretation
        )

        # 6. Serialize and return the result
        result_serializer = AssessmentResultSerializer(result)
        return Response(result_serializer.data, status=status.HTTP_201_CREATED)


    @action(detail=False, methods=['get'])
    def history(self, request):
        """Returns the patient's history of assessment results."""
        queryset = self.get_queryset()
        serializer = AssessmentResultSerializer(queryset, many=True)
        return Response(serializer.data)

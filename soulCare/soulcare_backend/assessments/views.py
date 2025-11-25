from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView # REQUIRED FOR ADAPTIVE VIEW

# --- NECESSARY DJANGO/PROJECT IMPORTS ---
from django.utils import timezone
from authapp.models import PatientProfile
from content.models import ContentItem
# ----------------------------------------

from .models import Questionnaire, Question, AssessmentResult, DEPRESSION_LEVELS
from .serializers import (
    QuestionSerializer,
    AssessmentResponseInputSerializer,
    AssessmentResultSerializer
)
from .utils import (
    calculate_scaled_score_and_level,
    call_llama_for_classification,
    get_adaptive_questions_list,
    calculate_standard_assessment_level,
    map_risk_to_content_tags
)
from .question_bank import PHQ9_MASTER_QUESTIONS


PHQ9_MAX_RAW_SCORE = 27

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
            latest_assessment = Questionnaire.objects.filter(is_active=True).latest('created_at')
        except Questionnaire.DoesNotExist:
            return Response({"detail": "No active assessment found."}, status=status.HTTP_404_NOT_FOUND)

        questions = latest_assessment.questions.all()
        serializer = self.get_serializer_class()(questions, many=True)
        return Response({
            'title': latest_assessment.title,
            'description': latest_assessment.description,
            'questions': serializer.data,
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
        # Using calculate_scaled_score_and_level which is intended for the basic assessment score mapping
        scaled_score, level_key, interpretation = calculate_scaled_score_and_level(raw_score)

        # 5. Create the AssessmentResult object (Using correct field submitted_at)
        result = AssessmentResult.objects.create(
            patient=request.user,
            questionnaire=latest_assessment,
            raw_score=raw_score,
            scaled_score=scaled_score,
            level=level_key, # Use the integer key for the model field
            interpretation=interpretation,
            submitted_at=timezone.now()
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


# =========================================================================
# NEW COMPONENT: ADAPTIVE QUESTIONNAIRE VIEWS
# =========================================================================

class AdaptiveAssessmentView(APIView):
    """
    Handles the personalized, adaptive questionnaire flow and risk classification
    using Llama 3.2. This generates content recommendations.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Generates the personalized list of questions based on the patient's profile.
        """
        user = request.user
        if user.role != 'user':
            return Response({"detail": "Only patients can access the adaptive assessment."}, status=status.HTTP_403_FORBIDDEN)

        try:
            profile = user.patientprofile
        except PatientProfile.DoesNotExist:
            return Response({"detail": "Please complete your profile details first."}, status=status.HTTP_400_BAD_REQUEST)

        # 1. APPLY ADAPTIVE LOGIC
        personalized_questions = get_adaptive_questions_list(profile)

        # 2. Structure the response for the frontend
        return Response({
            'title': "Personalized Health Check",
            'description': "Questions customized to your current life situation.",
            'questions': personalized_questions,
            'max_raw_score': PHQ9_MAX_RAW_SCORE,
        })


    def post(self, request):
        """
        Processes responses, classifies risk via LLM, saves the result,
        and returns content recommendations.
        """
        user = request.user

        # 1. Validate Input
        serializer = AssessmentResponseInputSerializer(data=request.data.get('responses'), many=True)
        serializer.is_valid(raise_exception=True)
        validated_responses = serializer.validated_data

        try:
            profile = user.patientprofile
        except PatientProfile.DoesNotExist:
            return Response({"detail": "Patient profile missing."}, status=status.HTTP_400_BAD_REQUEST)

        # --- LLM CLASSIFICATION ---

        # 2. Calculate raw PHQ-9 score
        phq9_ids = [q['id'] for q in PHQ9_MASTER_QUESTIONS if q.get('is_phq9_item')]

        raw_score = 0
        responses_dict = {item['question_id']: item['score'] for item in validated_responses}
        for qid in phq9_ids:
            raw_score += responses_dict.get(qid, 0)

        # 3. Call Llama 3.2 for classification
        try:
            llama_result = call_llama_for_classification(profile, validated_responses)
            llm_level = llama_result.get('classification_level', 'low')
            llm_interpretation = llama_result.get('justification', 'Analysis inconclusive due to system error.')
        except Exception as e:
            # Fallback
            llm_level = 'medium'
            llm_interpretation = f"System Error: Failed to receive LLM classification. Risk set to medium fallback. Details: {e}"

        # --- SAVE RESULT & UPDATE PROFILE ---

        # 4. Save the result to history
        try:
            # Attempt to find a generic or latest questionnaire entry for FK
            generic_questionnaire = Questionnaire.objects.latest('created_at')
        except Questionnaire.DoesNotExist:
            generic_questionnaire = None

        # We must map the LLM risk string back to the integer key if the model requires it
        level_map = {v: k for k, v in [('low', 1), ('medium', 3), ('high', 5)]}
        level_key = level_map.get(llm_level.lower(), 1)


        result = AssessmentResult.objects.create(
            patient=user,
            questionnaire=generic_questionnaire, # Link to the generic one or placeholder
            raw_score=raw_score,
            scaled_score=raw_score, # Use raw score as scaled for simplicity in this flow
            level=level_key, # Use the mapped integer key
            interpretation=llm_interpretation,
            submitted_at=timezone.now()
        )

        # 5. Update PatientProfile for quick lookup
        profile.risk_level = llm_level
        # profile.latest_phq9_score = raw_score # Uncomment if PatientProfile has this field
        # profile.last_assessment_date = timezone.now() # Uncomment if PatientProfile has this field
        profile.save()

        # --- CONTENT RECOMMENDATION LOGIC ---

        # 6. Determine content tags based on LLM result or current risk level
        required_tags = map_risk_to_content_tags(llm_level, raw_score, profile)

        # 7. Fetch content items
        recommended_content = ContentItem.objects.filter(
            tags__name__in=required_tags
        ).distinct()[:5]

        return Response({
            "assessment_result": {
                "risk_level": llm_level,
                "total_score": raw_score,
                "justification": llm_interpretation
            },
            "content_recommendations": [
                {"title": item.title, "type": item.content_type, "url": item.file}
                for item in recommended_content
            ],
            "recommended_tags": required_tags,
        }, status=status.HTTP_201_CREATED)

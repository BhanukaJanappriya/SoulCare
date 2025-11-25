# soulcare_backend/assessments/serializers.py

from rest_framework import serializers
from .models import Question, AssessmentResult, DEPRESSION_LEVELS

# --- Question Data for Frontend ---

class QuestionSerializer(serializers.ModelSerializer):
    """Serializes the question data for the client."""
    class Meta:
        model = Question
        fields = ['id', 'text', 'order', 'questionnaire']
        read_only_fields = ['questionnaire']


# --- Submission Input for Backend ---

class AssessmentResponseInputSerializer(serializers.Serializer):
    """Handles the list of question ID and score received from the patient."""
    question_id = serializers.IntegerField()
    score = serializers.IntegerField(min_value=0, max_value=4)

    def validate_score(self, value):
        """Custom validation to ensure score is in the allowed range [0, 4]."""
        if value < 0 or value > 4:
            raise serializers.ValidationError("Score must be between 0 and 4.")
        return value



# --- Result Data for Frontend ---
class AssessmentResultSerializer(serializers.ModelSerializer):
    """Serializes the final result for the client."""
    questionnaire_title = serializers.CharField(source='questionnaire.title', read_only=True)
    level_display = serializers.CharField(source='get_level_display', read_only=True)

    class Meta:
        model = AssessmentResult
        fields = [
            'id',
            'questionnaire_title',
            'raw_score',
            'scaled_score',
            'level',
            'level_display',
            'interpretation',
            'submitted_at'
        ]

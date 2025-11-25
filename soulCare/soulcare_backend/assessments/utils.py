
from typing import Dict, List
from .models import DEPRESSION_LEVELS
import json
import requests
from django.db.models import Q
from authapp.models import PatientProfile
from .question_bank import PHQ9_MASTER_QUESTIONS
from datetime import datetime
from typing import List, Dict, Any

# FIX: Ensure List and Dict (and Any for safety) are imported

# The scaling factor: Max Scaled Score (100) / Max Raw Score (80) = 1.25
SCALING_FACTOR = 1.25
PHQ9_MAX_RAW_SCORE = 27
LLAMA_API_URL = "http://localhost:11434/api/generate"
LLAMA_MODEL_NAME = "llama3.2"
# Score Interpretation Mapping (based on scaled score out of 100)
# Format: (min_score_inclusive, max_score_inclusive, level_index, interpretation_text)
SCORE_INTERPRETATION_MAP = [
    (0, 18, 1, "Your score suggests you are currently not experiencing symptoms indicative of clinical depression. Maintain your well-being."),
    (19, 36, 2, "Your score suggests few signs of depression. While you may be experiencing some mild stress, it is generally low. Keep tracking your mood."),
    (37, 63, 3, "Your score suggests possible signs of depression. It is important to monitor these feelings, utilize your journal, and consider booking an appointment with a counselor."),
    (64, 81, 4, "Your score suggests some signs of clinical depression. This warrants attention. Please reach out to a doctor or counselor immediately and prioritize self-care."),
    (82, 100, 5, "Your score suggests generally depressed mood. This result is serious. Please contact emergency services or a mental health professional right away."),
]

def calculate_scaled_score_and_level(raw_score: int) -> tuple[int, int, str]:
    """
    Calculates the scaled score (out of 100) and determines the depression level
    and interpretation text based on the raw score (max 80).
    """
    # 1. Scale the raw score
    scaled_score = round(raw_score * SCALING_FACTOR)
    scaled_score = min(scaled_score, 100) # Ensure it doesn't exceed 100

    # 2. Determine the level and interpretation
    level = 0
    interpretation = "Unknown result."

    for min_s, max_s, lvl, text in SCORE_INTERPRETATION_MAP:
        if min_s <= scaled_score <= max_s:
            level = lvl
            interpretation = text
            break

    return scaled_score, level, interpretation


def map_risk_to_content_tags(level, raw_phq9_score):
    tags = []

    # 1. Tags based on overall Risk Level
    if level == 'high':
        tags.extend(['crisis-plan', 'severe-symptoms', 'professional-help'])
    elif level == 'medium':
        tags.extend(['coping-skills', 'mood-management', 'therapy-info'])
    else: # low
        tags.extend(['well-being', 'prevention', 'mindfulness'])

    # 2. Tags based on Symptom Type (Heuristic using PHQ-9 items)
    if raw_phq9_score >= 10: # If clinically significant
        # Check specific severe symptoms reported by the patient
        # (This would require passing the detailed responses)
        # For simplicity here:
        if raw_phq9_score > 15:
            tags.append('motivation-techniques')

    # 3. Tags based on Profile Context (to be added)
    # if profile.employment_status in ['E', 'S']:
    #     tags.append('work-stress')

    return list(set(tags)) # Return unique tags

# =========================================================================
# 1. ADAPTIVE LOGIC UTILITY (Robustness checks included)
# =========================================================================

def get_adaptive_questions_list(profile: PatientProfile) -> List[Dict[str, Any]]:
    """
    Filters the master question bank based on the patient's profile data
    to create a personalized assessment.
    """

    # 1. Gather Demographic Data (Ensure safe default values against None)
    demographics = {
        # Use str() to safely handle None for Choice fields
        'gender': str(profile.gender) if profile.gender else None,
        'marital_status': str(profile.marital_status) if profile.marital_status else None,
        'employment_status': str(profile.employment_status) if profile.employment_status else None,

        # Ensure booleans/integers have a fallback value (False/0) if None
        'chronic_illness': profile.chronic_illness if profile.chronic_illness is not None else False,
        'substance_use': profile.substance_use if profile.substance_use is not None else False,
        'financial_stress_level': profile.financial_stress_level if profile.financial_stress_level is not None else 0
    }

    personalized_questions = []

    for q in PHQ9_MASTER_QUESTIONS:
        is_skipped = False

        # Check explicit skip conditions (marital_status__S, gender__M, etc.)
        if q.get("skip_if"):
            for condition in q["skip_if"]:
                field, value_code = condition.split("__")

                # Retrieve demographic value safely
                demographic_value = demographics.get(field)

                if demographic_value is None:
                    continue # Cannot skip if profile data is missing

                # Handling for boolean fields (like chronic_illness, substance_use)
                if field in ['chronic_illness', 'substance_use']:
                    expected_bool = value_code == 'True'
                    if demographic_value == expected_bool:
                        is_skipped = True
                        break

                # Handling for Choice fields (like marital_status, gender)
                elif demographic_value == value_code:
                    is_skipped = True
                    break

        if is_skipped:
            continue

        # Check explicit include conditions (Only ask if this is TRUE)
        if q.get("include_if"):
            must_include = False
            for condition in q["include_if"]:
                field, value_code = condition.split("__")
                demographic_value = demographics.get(field)

                if demographic_value is None:
                    continue

                # Handling for boolean fields
                if field in ['chronic_illness', 'substance_use']:
                    expected_bool = value_code == 'True'
                    if demographic_value == expected_bool:
                        must_include = True
                        break

                # Handling for Choice fields
                elif demographic_value == value_code:
                    must_include = True
                    break

            if not must_include:
                continue

        # Check value threshold conditions (e.g., financial_stress_level > 2)
        if q.get("include_if_profile_value_gt"):
            field, threshold_str = q["include_if_profile_value_gt"]
            threshold = int(threshold_str)

            # Use safe fallback value (0) if stress level is None/missing
            current_value = demographics.get(field, 0)

            if current_value <= threshold:
                continue

        # If it passes all checks, include the question.
        personalized_questions.append({
            "id": q["id"],
            "text": q["text"],
            "category": q["category"],
            "scores": q["scores"],
            "is_phq9_item": q["is_phq9_item"],
        })

    return personalized_questions


# =========================================================================
# 2. LLM CLASSIFICATION UTILITY
# =========================================================================

def call_llama_for_classification(profile: PatientProfile, validated_responses: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Formats the prompt using profile and scores, calls Llama 3.2, and parses the result.
    """

    # Format scores into a readable dictionary
    scores_dict = {item['question_id']: item['score'] for item in validated_responses}

    # Calculate the raw score of the standard PHQ-9 items
    phq9_ids = [q['id'] for q in PHQ9_MASTER_QUESTIONS if q.get('is_phq9_item')]
    phq9_raw_score = sum(scores_dict.get(qid, 0) for qid in phq9_ids)

    # Generate the prompt for Llama 3.2
    prompt = f"""
    # SYSTEM INSTRUCTION
    You are an expert clinical depression classifier specializing in nuanced risk assessment.
    Analyze the patient's demographic context and their questionnaire scores. Use the PHQ-9 raw score as a guideline, but factor in contextual responses (like work stress or chronic illness) to refine the risk level.

    CLASSIFY the patient's risk into one of these clinical levels: 'low', 'medium', or 'high'.
    Output ONLY a JSON object.

    # PATIENT CONTEXT
    - Gender: {profile.get_gender_display()}
    - Marital Status: {profile.get_marital_status_display()}
    - Employment Status: {profile.get_employment_status_display()}
    - Chronic Illness: {'Yes' if profile.chronic_illness else 'No'}
    - Substance Use History: {'Yes' if profile.substance_use else 'No'}
    - Financial Stress (1-5): {profile.financial_stress_level or '1'}
    - Standard PHQ-9 Raw Score (0-27): {phq9_raw_score}

    # ALL QUESTIONNAIRE SCORES (0=Not at all, 3=Nearly every day)
    {json.dumps(scores_dict, indent=2)}

    # OUTPUT FORMAT (JSON ONLY)
    {{
      "classification_level": "low|medium|high",
      "justification": "A brief analysis of how the score and context led to the classification."
    }}
    """

    headers = {'Content-Type': 'application/json'}
    data = {
        "model": LLAMA_MODEL_NAME,
        "prompt": prompt,
        "stream": False,
        "format": "json"
    }

    try:
        response = requests.post(LLAMA_API_URL, headers=headers, json=data, timeout=45)
        response.raise_for_status()

        llm_output = response.json().get('response', '{}')
        return json.loads(llm_output)

    except requests.exceptions.RequestException as e:
        print(f"ERROR: Llama 3.2 API connection failed. Check Ollama server. {e}")
        raise ConnectionError("LLM API connection failed.")
    except json.JSONDecodeError:
        print("ERROR: LLM returned malformed JSON.")
        raise ValueError("LLM returned malformed JSON.")


# =========================================================================
# 3. FALLBACK & STANDARD SCORING UTILITIES
# =========================================================================

def calculate_standard_assessment_level(raw_score: int) -> tuple[int, str, str]:
    """
    Performs standard PHQ-9 scoring.
    Returns (scaled_score, level, interpretation).
    """

    # Standard PHQ-9 Cutoffs (0-27)
    if raw_score >= 20:
        level = 'high' # Severe
        interpretation = "The score indicates severe major depression. Immediate professional intervention is strongly recommended."
    elif raw_score >= 15:
        level = 'medium' # Moderately Severe
        interpretation = "The score suggests moderately severe depression. Professional evaluation is highly advised."
    elif raw_score >= 10:
        level = 'medium' # Moderate
        interpretation = "The score indicates moderate depression. Counseling or therapy should be considered."
    elif raw_score >= 5:
        level = 'low' # Mild
        interpretation = "The score suggests mild depression. Monitoring mood and lifestyle changes is recommended."
    else: # 0-4
        level = 'low' # Minimal
        interpretation = "The score indicates minimal or no depression. Focus on preventative well-being practices."

    # Scaled score (e.g., 0-100 where 27 maps to 100)
    scaled_score = round((raw_score / PHQ9_MAX_RAW_SCORE) * 100)

    return scaled_score, level, interpretation


def calculate_scaled_score_and_level(raw_score: int) -> tuple[int, int, str]:
    """
    Standard function used by AssessmentViewSet for the basic quiz (raw score max 80).
    Returns (raw_score, level_key, interpretation).
    """
    # Mapping for raw score max 80 (assuming DEPRESSION_LEVELS max is 5)

    # Calculate scaled score (0-100)
    max_raw_score_basic = 80
    scaled_score = round((raw_score / max_raw_score_basic) * 100)

    # Determine level key (1-5) based on scaled score (adjust cutoffs as needed)
    if scaled_score >= 82: # Generally depressed (Level 5)
        level_key = 5
        interpretation = "Generally depressed (82-100)"
    elif scaled_score >= 64: # Some signs of clinical depression (Level 4)
        level_key = 4
        interpretation = "Some signs of clinical depression (64-81)"
    elif scaled_score >= 37: # Possible signs of depression (Level 3)
        level_key = 3
        interpretation = "Possible signs of depression (37-63)"
    elif scaled_score >= 19: # Few signs of depression (Level 2)
        level_key = 2
        interpretation = "Few signs of depression (19-36)"
    else: # Not depressed (Level 1)
        level_key = 1
        interpretation = "Not depressed (0-18)"

    return scaled_score, level_key, interpretation


def map_risk_to_content_tags(level: str, raw_phq9_score: int, profile: PatientProfile) -> List[str]:
    """
    Maps the final classification level and contextual data to relevant content tags.
    """
    tags = []

    # 1. Tags based on overall Risk Level
    if level == 'high':
        tags.extend(['crisis-plan', 'severe-symptoms', 'professional-help'])
    elif level == 'medium':
        tags.extend(['coping-skills', 'mood-management', 'therapy-info'])
    else: # low
        tags.extend(['well-being', 'prevention', 'mindfulness'])

    # 2. Tags based on Profile Context (to refine recommendations)
    # Check for employment status (E/S) AND financial stress level >= 3
    if profile.employment_status in ['E', 'S'] and profile.financial_stress_level and profile.financial_stress_level >= 3:
        tags.append('work-stress')

    if profile.chronic_illness:
        tags.append('chronic-pain-coping')

    if profile.marital_status in ['D', 'W']:
        tags.append('grief-loss')

    return list(set(tags))

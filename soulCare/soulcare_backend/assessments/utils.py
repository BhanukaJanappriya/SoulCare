# soulcare_backend/assessments/utils.py

from .models import DEPRESSION_LEVELS

# The scaling factor: Max Scaled Score (100) / Max Raw Score (80) = 1.25
SCALING_FACTOR = 1.25

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

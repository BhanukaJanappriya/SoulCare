# MAPPING CODES:
# These codes correspond to the PatientProfile fields and their choice values (authapp/models.py).
# Format: field_name__choice_code (e.g., marital_status__S for Single)

# GENDER: M (Male), F (Female), O (Other), P (Prefer not to say)
# MARITAL: S (Single/Never Married), M (Married/Cohabiting), D (Divorced/Separated), W (Widowed)
# EMPLOYMENT: E (Employed), U (Unemployed/Seeking), S (Student), R (Retired), H (Homemaker), D (Disabled/Unable to work)
# BOOLEANS: True (Field is True), False (Field is False)

PHQ9_SCORING_OPTIONS = [
    (0, "Not at all"),
    (1, "Several days"),
    (2, "More than half the days"),
    (3, "Nearly every day"),
]

PHQ9_MASTER_QUESTIONS = [
    # ----------------------------------------------------------------------
    # 1. CORE MOOD & ANHEDONIA (PHQ-9 Items 1-2) - ALWAYS INCLUDED
    # ----------------------------------------------------------------------
    {
        "id": "q1_interest",
        "text": "Little interest or pleasure in doing things?",
        "category": "Core Mood",
        "scores": PHQ9_SCORING_OPTIONS,
        "is_phq9_item": True,
    },
    {
        "id": "q2_depressed",
        "text": "Feeling down, depressed, or hopeless?",
        "category": "Core Mood",
        "scores": PHQ9_SCORING_OPTIONS,
        "is_phq9_item": True,
    },

    # ----------------------------------------------------------------------
    # 2. PHYSICAL & SOMATIC SYMPTOMS (PHQ-9 Items 3-6) - General filter: Chronic Illness
    # ----------------------------------------------------------------------
    {
        "id": "q3_sleep",
        "text": "Trouble falling or staying asleep, or sleeping too much?",
        "category": "Physical Symptoms",
        "scores": PHQ9_SCORING_OPTIONS,
        "is_phq9_item": True,
    },
    {
        "id": "q4_tired",
        "text": "Feeling tired or having little energy?",
        "category": "Physical Symptoms",
        "scores": PHQ9_SCORING_OPTIONS,
        "is_phq9_item": True,
        # NOTE: If user has chronic_illness=True, the system should add a prompt
        # but the question itself is always necessary for a PHQ-9 score.
    },
    {
        "id": "q5_appetite",
        "text": "Poor appetite or overeating?",
        "category": "Physical Symptoms",
        "scores": PHQ9_SCORING_OPTIONS,
        "is_phq9_item": True,
    },
    {
        "id": "q6_self_worth",
        "text": "Feeling bad about yourself—or that you are a failure or have let yourself or your family down?",
        "category": "Self-Esteem & Guilt",
        "scores": PHQ9_SCORING_OPTIONS,
        "is_phq9_item": True,
    },

    # ----------------------------------------------------------------------
    # 3. COGNITIVE & MOTOR SYMPTOMS (PHQ-9 Items 7-8)
    # ----------------------------------------------------------------------
    {
        "id": "q7_concentrating",
        "text": "Trouble concentrating on things, such as reading the newspaper or watching television?",
        "category": "Cognitive Function",
        "scores": PHQ9_SCORING_OPTIONS,
        "is_phq9_item": True,
    },
    {
        "id": "q8_motor",
        "text": "Moving or speaking so slowly that other people could have noticed? Or the opposite—being so fidgety or restless that you have been moving around a lot more than usual?",
        "category": "Motor Function",
        "scores": PHQ9_SCORING_OPTIONS,
        "is_phq9_item": True,
    },

    # ----------------------------------------------------------------------
    # 4. SAFETY CHECK (PHQ-9 Item 9) - CRITICAL, ALWAYS LAST
    # ----------------------------------------------------------------------
    {
        "id": "q9_suicide",
        "text": "Thoughts that you would be better off dead or of hurting yourself in some way?",
        "category": "Safety Check",
        "scores": PHQ9_SCORING_OPTIONS,
        "is_phq9_item": True,
    },

    # ----------------------------------------------------------------------
    # 5. ADAPTIVE - RELATIONSHIP CONTEXT
    # ----------------------------------------------------------------------
    {
        "id": "rel_conflict",
        "text": "In the past three months, have you had a major fight or conflict with your partner/spouse?",
        "category": "Social Dynamics",
        "scores": PHQ9_SCORING_OPTIONS,
        "is_phq9_item": False,
        "skip_if": ["marital_status__S", "marital_status__W", "marital_status__D"], # Skip if single, widowed, or divorced
    },
    {
        "id": "rel_divorce_recent",
        "text": "Have you been processing or dealing with a recent separation or divorce in the last 6 months?",
        "category": "Social Dynamics",
        "scores": PHQ9_SCORING_OPTIONS,
        "is_phq9_item": False,
        "include_if": ["marital_status__D"], # Only include if Divorced/Separated
    },

    # ----------------------------------------------------------------------
    # 6. ADAPTIVE - HEALTH & BIOLOGY CONTEXT
    # ----------------------------------------------------------------------
    {
        "id": "health_chronic_stress",
        "text": "Does your physical health condition (e.g., chronic illness) cause you significant daily stress or pain?",
        "category": "Health & Body",
        "scores": PHQ9_SCORING_OPTIONS,
        "is_phq9_item": False,
        "include_if": ["chronic_illness__True"], # Only include if they reported a chronic illness
    },
    {
        "id": "bio_hormonal",
        "text": "In the past week, have you experienced unusual mood swings or distress related to your menstrual cycle or hormonal changes?",
        "category": "Health & Body",
        "scores": PHQ9_SCORING_OPTIONS,
        "is_phq9_item": False,
        "skip_if": ["gender__M"], # Skip if Male
    },

    # ----------------------------------------------------------------------
    # 7. ADAPTIVE - WORK & FINANCE CONTEXT
    # ----------------------------------------------------------------------
    {
        "id": "work_burnout",
        "text": "Do you feel severely burnt out or exhausted specifically due to your job or studies?",
        "category": "Work/Finance Stress",
        "scores": PHQ9_SCORING_OPTIONS,
        "is_phq9_item": False,
        "skip_if": ["employment_status__U", "employment_status__R", "employment_status__H", "employment_status__D"], # Skip if unemployed, retired, homemaker, or disabled
    },
    {
        "id": "finance_worry",
        "text": "How much has worry about money or financial difficulty affected your mood in the past 2 weeks?",
        "category": "Work/Finance Stress",
        "scores": PHQ9_SCORING_OPTIONS,
        "is_phq9_item": False,
        # NOTE: No skip_if, but only asked if financial_stress_level > 2 (Medium/High)
        "include_if_profile_value_gt": ["financial_stress_level", 2],
    },

    # ----------------------------------------------------------------------
    # 8. ADAPTIVE - SUBSTANCE USE & HISTORY
    # ----------------------------------------------------------------------
    {
        "id": "substance_impact",
        "text": "Have your drinking or drug habits made your feelings of sadness or hopelessness worse?",
        "category": "History & Substance Use",
        "scores": PHQ9_SCORING_OPTIONS,
        "is_phq9_item": False,
        "include_if": ["substance_use__True"], # Only ask if they reported substance use history
    },
]

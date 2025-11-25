# soulcare_backend/chatbot/deepseek_hybrid_service.py (COMPLETE CONTENTS)

import os
import random
import string
import nltk

# API CLIENT
from openai import OpenAI

# NLTK COMPONENTS
from nltk.stem import WordNetLemmatizer
from nltk.sentiment.vader import SentimentIntensityAnalyzer
# NOTE: Ensure you ran: nltk.download('punkt'), nltk.download('wordnet'), and nltk.download('vader_lexicon')


# --- NLTK INITIALIZATION (Safety and NLP Tools) ---
lemmatizer = WordNetLemmatizer()
remove_punctuation_map = dict((ord(char), None) for char in string.punctuation)
sid = SentimentIntensityAnalyzer()


# --- API CLIENT INITIALIZATION (DeepSeek V3 via Gateway) ---
API_KEY = os.getenv("OPENAI_API_KEY")
BASE_URL = os.getenv("OPENAI_BASE_URL")

if not API_KEY or not BASE_URL:
    # This error will halt the server if the .env file is missing or variables aren't loaded
    raise ValueError("API environment variables (OPENAI_API_KEY/BASE_URL) not set. Check .env and settings.py.")

client = OpenAI(
    api_key=API_KEY,
    base_url=BASE_URL
)


# --- SAFETY & CONTEXT DEFINITIONS ---

CRISIS_RESPONSE = {
    'keywords': ['suicide', 'kill myself', 'hurt myself', 'end it', 'imminent danger', 'emergency', 'want to die', 'overdose'],
    'response': "🛑 **IMMEDIATE CRISIS:** It sounds like you are in immense pain. Please know you are not alone. **Call or text 988 (US/Canada) or your local emergency number immediately.** Seek professional help now."
}

SYSTEM_PROMPT = (
    "You are a compassionate, non-judgemental mental health support bot named SoulCare. "
    "Your primary goal is empathetic listening and guiding the user toward self-care skills (e.g., deep breathing, journaling, reaching out to a provider). "
    "NEVER diagnose, prescribe, or give medical advice. Keep responses concise, supportive, and action-oriented when appropriate."
)

# This dictionary is only needed here for NLTK's keyword matching in get_intent()
INTENTS = {
    'greeting': {'keywords': ['hi', 'hello', 'hey', 'good', 'fine']},
    'ask_mood': {'keywords': ['sad', 'depressed', 'stressed', 'anxiety', 'low', 'awful', 'terrible']},
    'goodbye': {'keywords': ['bye', 'goodbye', 'later', 'quit']},
    'thank_you': {'keywords': ['thanks', 'thank you', 'appreciate']}
}


# --- NLTK HELPER FUNCTIONS ---

def clean_text(text):
    """Converts text to lowercase and removes punctuation."""
    return text.lower().translate(remove_punctuation_map)

def tokenize_and_lemmatize(text):
    """Tokenizes and lemmatizes the cleaned text."""
    tokens = nltk.word_tokenize(text)
    return [lemmatizer.lemmatize(word) for word in tokens]

def get_sentiment(text):
    """Returns the compound sentiment score (-1 to 1)."""
    return sid.polarity_scores(text)['compound']

def get_intent(user_input):
    """Identifies the user intent based on keyword matching, prioritizing Crisis."""
    cleaned_input = clean_text(user_input)
    lemmas = tokenize_and_lemmatize(cleaned_input)

    # 1. CRITICAL SAFETY CHECK
    for keyword in CRISIS_RESPONSE['keywords']:
        if clean_text(keyword) in cleaned_input:
            return 'crisis'

    # 2. Check general intents using lemmas for robustness
    for intent_name, intent_data in INTENTS.items():
        for keyword in intent_data['keywords']:
            lemmatized_keyword = lemmatizer.lemmatize(clean_text(keyword))
            if lemmatized_keyword in lemmas:
                return intent_name

    return 'general_chat' # Fallback for non-crisis, non-specific inputs


# --- GENERATIVE RESPONSE FUNCTION (API CALL) ---

def generate_empathetic_response(user_input, sentiment_score):
    """
    Uses the DeepSeek V3 0324 model to generate a thoughtful, comprehensive response.
    """

    prompt = (
        f"The user is sharing a feeling with a negative intensity score of {sentiment_score:.2f}. "
        f"User input: '{user_input}'. "
        "Provide a single, empathetic, and supportive response based on the SYSTEM_PROMPT instructions."
    )

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": prompt}
    ]

    try:
        response = client.chat.completions.create(
            # Using the optimized DeepSeek V3 model
            model="llama3.2",
            messages=messages,
            temperature=0.7
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"llama3 API Error: {e}")
        return "I apologize, I'm having trouble connecting to the support system right now. The API may be experiencing high load. Please try again later."


# --- MAIN HYBRID FUNCTION (Exposed to Django View) ---

def get_chatbot_response(user_input):
    """
    Main entry point. Performs NLTK safety check, then calls DeepSeek for generation.
    """

    intent = get_intent(user_input)
    sentiment_score = get_sentiment(user_input)

    # 1. HARD CRISIS OVERRIDE (Safety Check)
    if intent == 'crisis' or sentiment_score <= -0.8: # VADER score <= -0.8 is extremely negative
        return CRISIS_RESPONSE['response']

    # 2. GENERATIVE RESPONSE (If safe, use the API)
    return generate_empathetic_response(user_input, sentiment_score)

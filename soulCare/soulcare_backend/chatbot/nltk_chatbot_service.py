import nltk
from nltk.stem import WordNetLemmatizer
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import string

# --- INITIALIZATION ---
# Initialize the Lemmatizer
lemmatizer = WordNetLemmatizer()

# FIX: Initialize the VADER Sentiment Analyzer (This was missing)
sid = SentimentIntensityAnalyzer()

# Create a translation table to quickly remove punctuation from strings
remove_punctuation_map = dict((ord(char), None) for char in string.punctuation)


# --- 1. DEFINING MENTAL HEALTH INTENTS AND RESPONSES ---

CRISIS_RESPONSE = {
    'keywords': ['suicide', 'kill myself', 'hurt myself', 'end it', 'imminent danger', 'emergency', 'want to die', 'overdose'],
    'response': "🛑 **IMMEDIATE CRISIS:** It sounds like you are in immense pain. Please know you are not alone. **Call or text 988 (US/Canada) or your local emergency number immediately.** Seek professional help now."
}

INTENTS = {
    'greeting': {
        'keywords': ['hi', 'hello', 'hey', 'greetings', 'sup', 'good morning', 'good', 'fine', 'great'],
        'response': "Hello! I'm here to listen and offer supportive guidance. How are you feeling today?"
    },
    'ask_mood': {
        'keywords': ['sad', 'depressed', 'stressed', 'anxiety', 'down', 'awful', 'terrible', 'struggling', 'low', 'frustrated'],
        'response': "I'm sorry you're going through this. It takes courage to share that. Could you tell me a little more about what's bothering you? We can also try a quick calming exercise."
    },
    'sleep_trouble': {
        'keywords': ['sleep', 'tired', 'insomnia', 'can\'t sleep', 'awake'],
        'response': "Sleep troubles can make everything harder. Have you tried a grounding technique or a guided meditation before bed?"
    },
    'thank_you': {
        'keywords': ['thanks', 'thank you', 'grateful', 'appreciate'],
        'response': "You're very welcome. Remember I'm always here if you need to talk or practice a calming skill."
    },
    'goodbye': {
        'keywords': ['bye', 'goodbye', 'see ya', 'later', 'quit'],
        'response': "Take care of yourself. I hope you feel better soon! Looking forward to our next chat."
    },
    'default': {
        'keywords': [],
        'response': "I'm not sure how to respond to that. Could you rephrase? I'm best at offering emotional support or guiding you to resources."
    }
}

# --- 2. TEXT PROCESSING FUNCTIONS ---

def clean_text(text):
    """Converts text to lowercase and removes punctuation."""
    return text.lower().translate(remove_punctuation_map)

def tokenize_and_lemmatize(text):
    """Tokenizes and lemmatizes the cleaned text."""
    tokens = nltk.word_tokenize(text)
    return [lemmatizer.lemmatize(word) for word in tokens]

# FIX: Moved this function up so it's grouped with other helpers
def get_sentiment(text):
    """Returns the compound sentiment score (-1 to 1)."""
    # This works now because 'sid' is defined at the top
    return sid.polarity_scores(text)['compound']

def get_intent(user_input):
    """
    Identifies the user intent based on keyword matching.
    """
    cleaned_input = clean_text(user_input)
    lemmas = tokenize_and_lemmatize(cleaned_input)

    # 1. CRITICAL SAFETY CHECK
    for keyword in CRISIS_RESPONSE['keywords']:
        if clean_text(keyword) in cleaned_input:
            return 'crisis'

    # 2. Check for Specific Mood/State Intents
    for intent_name in ['ask_mood', 'sleep_trouble']:
        intent_data = INTENTS[intent_name]
        for keyword in intent_data['keywords']:
            lemmatized_keyword = lemmatizer.lemmatize(clean_text(keyword))
            if lemmatized_keyword in lemmas:
                return intent_name

    # 3. Check for General Intents
    for intent_name in ['greeting', 'thank_you', 'goodbye']:
        intent_data = INTENTS[intent_name]
        for keyword in intent_data['keywords']:
            lemmatized_keyword = lemmatizer.lemmatize(clean_text(keyword))
            if lemmatized_keyword in lemmas:
                return intent_name

    # 4. Default
    return 'default'

def get_chatbot_response(user_input):
    """Main function to get the chatbot response."""
    intent = get_intent(user_input)

    if intent == 'crisis':
        return CRISIS_RESPONSE['response']
    else:
        return INTENTS.get(intent, INTENTS['default'])['response']


# --- 3. CONSOLE TEST LOOP ---

if __name__ == '__main__':
    print("🤖 SoulCare Bot: Hello! I'm here to listen. Type 'quit' to exit.")

    while True:
        user_input = input("You: ")

        if user_input.lower() in ['quit', 'exit']:
            print("🤖 SoulCare Bot: Goodbye! Take care.")
            break

        response = get_chatbot_response(user_input)
        print(f"🤖 SoulCare Bot: {response}")


def get_sentiment(text):
    """Returns the compound sentiment score (-1 to 1)."""
    return sid.polarity_scores(text)['compound']

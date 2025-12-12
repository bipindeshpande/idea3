"""Scoring map for psyche profiling questionnaire

Each question maps answer choices to score deltas for different axes.
Deltas are typically ±0.05 to ±0.20, with motivation questions using larger deltas.
"""

# Question definitions
QUESTIONS = [
    {
        "question_id": "Q1",
        "text": "When starting something new, you usually prefer to:",
        "options": [
            {"id": "A", "label": "Explore multiple possibilities"},
            {"id": "B", "label": "Pick one clear path and execute"},
            {"id": "C", "label": "Follow a proven approach"}
        ]
    },
    {
        "question_id": "Q2",
        "text": "When making decisions, you prioritize:",
        "options": [
            {"id": "A", "label": "Speed and action"},
            {"id": "B", "label": "Certainty and thoroughness"}
        ]
    },
    {
        "question_id": "Q3",
        "text": "In your work, you're most motivated by:",
        "options": [
            {"id": "A", "label": "Mastering skills and expertise"},
            {"id": "B", "label": "Freedom and independence"},
            {"id": "C", "label": "Making a meaningful impact"}
        ]
    },
    {
        "question_id": "Q4",
        "text": "When facing uncertainty, you tend to:",
        "options": [
            {"id": "A", "label": "Take calculated risks"},
            {"id": "B", "label": "Avoid risks and seek stability"}
        ]
    },
    {
        "question_id": "Q5",
        "text": "You prefer to work:",
        "options": [
            {"id": "A", "label": "In a team with others"},
            {"id": "B", "label": "Independently or solo"}
        ]
    },
    {
        "question_id": "Q6",
        "text": "When choosing between options, you:",
        "options": [
            {"id": "A", "label": "Compare many options thoroughly"},
            {"id": "B", "label": "Pick the first good enough option"}
        ]
    },
    {
        "question_id": "Q7",
        "text": "You're most energized by:",
        "options": [
            {"id": "A", "label": "New ideas and possibilities"},
            {"id": "B", "label": "Practical execution and results"}
        ]
    },
    {
        "question_id": "Q8",
        "text": "When things go wrong, you typically:",
        "options": [
            {"id": "A", "label": "Stay calm and adapt"},
            {"id": "B", "label": "Feel stressed and worry"}
        ]
    },
    {
        "question_id": "Q9",
        "text": "You prefer to:",
        "options": [
            {"id": "A", "label": "Agree and find common ground"},
            {"id": "B", "label": "Challenge and debate ideas"}
        ]
    },
    {
        "question_id": "Q10",
        "text": "Your ideal work environment emphasizes:",
        "options": [
            {"id": "A", "label": "Structure and organization"},
            {"id": "B", "label": "Flexibility and spontaneity"}
        ]
    },
    {
        "question_id": "Q11",
        "text": "When learning something new, you:",
        "options": [
            {"id": "A", "label": "Prefer structured courses and guides"},
            {"id": "B", "label": "Learn by doing and experimenting"}
        ]
    },
    {
        "question_id": "Q12",
        "text": "Your primary motivation for starting a business is:",
        "options": [
            {"id": "A", "label": "Building expertise and mastery in a domain"},
            {"id": "B", "label": "Having control and independence"},
            {"id": "C", "label": "Creating meaningful change or impact"}
        ]
    }
]

# Scoring map: question_id -> answer_id -> {axis: delta}
SCORING_MAP = {
    "Q1": {
        "A": {"O": +0.15, "C": -0.05},  # Explore -> High Openness, Lower Conscientiousness
        "B": {"O": -0.10, "C": +0.15},  # Execute -> Lower Openness, High Conscientiousness
        "C": {"O": -0.15, "C": +0.10}   # Proven -> Lower Openness, Higher Conscientiousness
    },
    "Q2": {
        "A": {"speed_vs_certainty": -0.20},  # Speed -> Lower certainty preference
        "B": {"speed_vs_certainty": +0.20}   # Certainty -> Higher certainty preference
    },
    "Q3": {
        "A": {"mastery": +0.4},   # Mastery motivation
        "B": {"autonomy": +0.4},  # Autonomy motivation
        "C": {"purpose": +0.4}    # Purpose motivation
    },
    "Q4": {
        "A": {"risk": +0.20, "N": -0.05},  # Risk-seeking -> Higher risk, Lower neuroticism
        "B": {"risk": -0.20, "N": +0.10}   # Risk-averse -> Lower risk, Higher neuroticism
    },
    "Q5": {
        "A": {"E": +0.15},  # Team -> Higher extraversion
        "B": {"E": -0.15}   # Solo -> Lower extraversion
    },
    "Q6": {
        "A": {"maximize": +0.20},  # Compare many -> Maximizer
        "B": {"maximize": -0.20}   # Good enough -> Satisficer
    },
    "Q7": {
        "A": {"O": +0.15},  # New ideas -> Higher openness
        "B": {"O": -0.15, "C": +0.10}  # Execution -> Lower openness, Higher conscientiousness
    },
    "Q8": {
        "A": {"N": -0.15},  # Stay calm -> Lower neuroticism
        "B": {"N": +0.15}   # Feel stressed -> Higher neuroticism
    },
    "Q9": {
        "A": {"A": +0.15},  # Agree -> Higher agreeableness
        "B": {"A": -0.15}   # Challenge -> Lower agreeableness
    },
    "Q10": {
        "A": {"C": +0.15},  # Structure -> Higher conscientiousness
        "B": {"C": -0.15, "O": +0.10}  # Flexibility -> Lower conscientiousness, Higher openness
    },
    "Q11": {
        "A": {"C": +0.10},  # Structured learning -> Higher conscientiousness
        "B": {"O": +0.10, "C": -0.05}  # Learn by doing -> Higher openness, Lower conscientiousness
    },
    "Q12": {
        "A": {"mastery": +0.4},   # Mastery motivation
        "B": {"autonomy": +0.4},  # Autonomy motivation
        "C": {"purpose": +0.4}    # Purpose motivation
    }
}

def get_questions():
    """Get all questions"""
    return QUESTIONS

def get_scoring_map():
    """Get scoring map"""
    return SCORING_MAP


import os

from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def generate_next_question(
    history
    ):
    messages = history.copy()

    messages.append(
    {
        "role": "user",
        "content": """
Ask the next interview question.

Only return the question.
Do not evaluate the candidate.
Do not provide feedback.
"""
    }
)
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=history
    )
    return response.choices[0].message.content

def evaluate_interview(
    transcript
):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": f"""
                Evaluate this interview.

                {transcript}

                Give:
                1. Score
                2. Strengths
                3. Weaknesses
                4. Feedback
                """
            }
        ]
    )
    f"""
You are a senior technical interviewer.

Evaluate the candidate.

Interview Transcript:
    Return:

    1. Score out of 10
    2. Strengths
    3. Weaknesses
    4. Final feedback
    """
    return response.choices[0].message.content
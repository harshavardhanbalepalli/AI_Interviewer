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
    prompt = f"""
    You are a technical interviewer.
    you will find the resume and jobdescription in the history 

    Generate ONE interview question.
    this is your previous question and candidates response now generate a follow up question
    {history}
    Do not provide explanations.
    """

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )
    return response.choices[0].message.content
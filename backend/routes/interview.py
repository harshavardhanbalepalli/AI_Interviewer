from fastapi import APIRouter, HTTPException

from database import SessionLocal
from models import Resume, JobDescription, Interview, Message, InterviewEvaluation
from schemas import (InterviewStartRequest, AnswerRequest, EndInterview)
from services.llm_service import generate_next_question, evaluate_interview

router = APIRouter()

@router.post("/start")
def start_interview(
    data: InterviewStartRequest
):
    db = SessionLocal()

    interview = Interview(
        resume_id=data.resume_id,
        jd_id=data.jd_id
    )

    db.add(interview)
    db.commit()
    db.refresh(interview)
    interview_id = interview.id
    resume = (
        db.query(Resume)
        .filter(Resume.id == data.resume_id)
        .first()
    )

    jd = (
        db.query(JobDescription)
        .filter(JobDescription.id == data.jd_id)
        .first()
    )

    history = [
    {
        "role": "system",
        "content": f"""
You are an experienced technical interviewer.

Your job is to conduct an interview.

Rules:
- Ask exactly ONE question at a time.
- Do NOT evaluate the candidate.
- Do NOT give scores.
- Do NOT give feedback.
- Ask follow-up questions based on previous answers.
- Use the resume and job description to personalize questions.
- Keep questions concise.

Resume:
{resume.resume_text}

Job Description:
{jd.description}
"""
    }
]

    question = generate_next_question(
        history
    )

    system_message = Message(
        interview_id=interview.id,
        role="system",
        content=f"""
    Resume:
    {resume.resume_text}
    Job Description:
    {jd.description}
    """
    )
    assistant_message = Message( 
        interview_id=interview.id,
        role="assistant",
        content=question
    )

    db.add(system_message)
    db.add(assistant_message)

    db.commit()
    db.close()
    return {
        "interview_id": interview_id,
        "question": question
    }
    

    
    
@router.post("/answer")
def store_response(
    data: AnswerRequest
):
    db = SessionLocal()

    user_message = Message(
        interview_id=data.interview_id,
        role="user",
        content=data.answer
    )

    db.add(user_message)
    db.commit()

    messages = (
        db.query(Message)
        .filter(
            Message.interview_id ==
            data.interview_id
        )
        .order_by(Message.id)
        .all()
    )

    history = []

    for msg in messages:
        history.append(
            {
                "role": msg.role,
                "content": msg.content
            }
        )

    next_question = generate_next_question(
        history
    )

    assistant_message = Message(
        interview_id=data.interview_id,
        role="assistant",
        content=next_question
    )

    db.add(assistant_message)
    db.commit()

    db.close()
    print(next_question)
    return{
     "question": next_question
  }

@router.post("/end")
def end_interview(
    data: EndInterview
):
    db = SessionLocal()
    messages = (
    db.query(Message)
    .filter(
        Message.interview_id ==
        data.interview_id
    )
    .all()
)
    transcript = ""
    for msg in messages:
     transcript += (
        f"{msg.role}: "
        f"{msg.content}\n\n"
     )
    evaluation = evaluate_interview(
    transcript
)
    evaluation_record = InterviewEvaluation(
    interview_id=data.interview_id,
    feedback=evaluation
)

    db.add(evaluation_record)
    db.commit()
    print(evaluation)
    return {
    "evaluation": evaluation
}    #raise HTTPException(...) #--> stop execution and return an error response 

@router.get("/result/{interview_id}")
def get_result(interview_id: int):
    db = SessionLocal()

    evaluation = (
    db.query(InterviewEvaluation)
    .filter(
        InterviewEvaluation.interview_id ==
        interview_id
    )
    .first()
)
    if not evaluation:
     raise HTTPException(
        status_code=404,
        detail="Evaluation not found"
    )

    return {
    "evaluation": evaluation.feedback
}

@router.get("/resumes")
def get_resumes():
    db = SessionLocal()

    resumes = db.query(Resume).all()

    return resumes

@router.get("/jds")
def get_jds():
    db = SessionLocal()

    jds = db.query(JobDescription).all()

    return jds
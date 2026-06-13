from fastapi import APIRouter, HTTPException

from database import SessionLocal
from models import Resume, JobDescription
from schemas import (InterviewStartRequest, AnswerRequest)
from services.llm_service import generate_next_question

router = APIRouter()

from fastapi import APIRouter

router = APIRouter()

history = list()

@router.post("/start")
def start_interview(
    data: InterviewStartRequest
):
    db = SessionLocal()
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
    history.append({
    "role": "system",
    "content": f"""
Resume:
{resume.resume_text}

Job Description:
{jd.description}
"""
})
    question = generate_next_question(
    history
)
    history.append({"role":"assistant",
                    "content":question})
    print(history)
    return {
    "question": question
}
    
@router.post("/answer")
def store_response(
    data:AnswerRequest 
):
  history.append({"role":"user",
                    "content":data.answer
                    })
    
  next_question = generate_next_question(
    history
)
  print(next_question)
  return{
     "question": next_question
  }


   
    #raise HTTPException(...) #--> stop execution and return an error response 
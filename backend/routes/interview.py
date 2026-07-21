import os
from dotenv import load_dotenv

from fastapi import APIRouter, HTTPException, Depends
from database import SessionLocal
from models import Resume, JobDescription, Interview, Message, InterviewEvaluation
from schemas import (InterviewStartRequest, AnswerRequest, EndInterview)
from services.livekit_service import create_interview_room
from auth.dependencies import (
    verify_agent, 
    get_current_user
)
router = APIRouter()
load_dotenv()

AGENT_API_KEY = os.getenv("AGENT_API_KEY")

@router.get("/internal/context/{interview_id}")
def get_interview_context(
    interview_id: int,
    _: None = Depends(verify_agent)
):
    db = SessionLocal()
    interview = (
    db.query(Interview)
    .filter(Interview.id == interview_id)
    .first()
)
    if not interview:
     raise HTTPException(
        status_code=404,
        detail="Interview not found"
    )
    resume = (
    db.query(Resume)
    .filter(Resume.id == interview.resume_id)
    .first()
)
    jd = (
    db.query(JobDescription)
    .filter(JobDescription.id == interview.jd_id)
    .first()
)
    messages = (
    db.query(Message)
    .filter(Message.interview_id == interview.id)
    .order_by(Message.id)
    .all()
)
    history = []

    for msg in messages:
      history.append({
        "role": msg.role,
        "content": msg.content
    })
    return {
    "interview_id": interview.id,
    "status": interview.status,
    "resume": resume.resume_text,
    "job_description": jd.description,
    "history": history
}



@router.post("/start")
async def start_interview(
    data: InterviewStartRequest,
     current_user=Depends(
        get_current_user
    )

):
    db = SessionLocal()

    interview = Interview(
       user_id = current_user["user_id"],
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
    livekit = await create_interview_room(
    interview,
    current_user,
)


    jd = (
        db.query(JobDescription)
        .filter(JobDescription.id == data.jd_id)
        .first()
    )

    db.close()
    return {
    "interview_id": interview_id,
    "livekit_token": livekit["token"],
    "room_name": livekit["room_name"]
}
    

    
    
# @router.post("/answer")
# def store_response(
#     data: AnswerRequest,
#     current_user=Depends(
#         get_current_user
#     )

# ):
#     db = SessionLocal()

#     user_message = Message(
#         interview_id=data.interview_id,
#         role="user",
#         content=data.answer
#     )

#     db.add(user_message)
#     db.commit()

#     messages = (
#         db.query(Message)
#         .filter(
#             Message.interview_id ==
#             data.interview_id
#         )
#         .order_by(Message.id)
#         .all()
#     )

#     history = []

#     for msg in messages:
#         history.append(
#             {
#                 "role": msg.role,
#                 "content": msg.content
#             }
#         )

#     next_question = generate_next_question(
#         history
#     )

#     assistant_message = Message(
#         interview_id=data.interview_id,
#         role="assistant",
#         content=next_question
#     )

#     db.add(assistant_message)
#     db.commit()

#     db.close()
#     print(next_question)
#     return{
#      "question": next_question
#   }

# @router.post("/end") #have to update the active status of interview to completed
# def end_interview(
#     data: EndInterview,
#     current_user=Depends(
#         get_current_user
#     )
# ):
#     db = SessionLocal()
#     messages = (
#     db.query(Message)
#     .filter(
#         Message.interview_id ==
#         data.interview_id
#     )
#     .all()
# )
#     transcript = ""
#     for msg in messages:
#      transcript += (
#         f"{msg.role}: "
#         f"{msg.content}\n\n"
#      )
#     evaluation = evaluate_interview(
#     transcript
# )
#     evaluation_record = InterviewEvaluation(
#     interview_id=data.interview_id,
#     feedback=evaluation
# )

#     db.add(evaluation_record)
#     db.commit()
#     print(evaluation)
#     return {
#     "evaluation": evaluation
# }    #raise HTTPException(...) #--> stop execution and return an error response 

@router.get("/result/{interview_id}")
def get_result(interview_id: int,
    current_user=Depends(
        get_current_user
    )):
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
def get_resumes(
    current_user=Depends(
        get_current_user
    )):
    db = SessionLocal()

    resumes = db.query(Resume).all()

    return resumes

@router.get("/jds")
def get_jds():
    db = SessionLocal()

    jds = db.query(JobDescription).all()

    return jds
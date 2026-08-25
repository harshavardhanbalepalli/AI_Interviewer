import os
from dotenv import load_dotenv

from fastapi import APIRouter, HTTPException, Depends
from database import SessionLocal
from models import Resume, JobDescription, Interview, Message, InterviewEvaluation, User
from schemas import (InterviewStartRequest, FinishInterviewRequest, EvaluationSubmitRequest)
from services.livekit_service import create_interview_room
from auth.dependencies import (
    verify_agent,
    get_current_user,
    require_admin
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



@router.post("/internal/evaluation/{interview_id}")
def submit_evaluation(
    interview_id: int,
    data: EvaluationSubmitRequest,
    _: None = Depends(verify_agent)
):
    db = SessionLocal()

    try:
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

        evaluation = (
            db.query(InterviewEvaluation)
            .filter(InterviewEvaluation.interview_id == interview_id)
            .first()
        )

        if evaluation:
            evaluation.technical_knowledge = data.technical_knowledge
            evaluation.problem_solving = data.problem_solving
            evaluation.communication = data.communication
            evaluation.relevance_to_jd = data.relevance_to_jd
            evaluation.overall_score = data.overall_score
            evaluation.summary = data.summary
        else:
            evaluation = InterviewEvaluation(
                interview_id=interview_id,
                technical_knowledge=data.technical_knowledge,
                problem_solving=data.problem_solving,
                communication=data.communication,
                relevance_to_jd=data.relevance_to_jd,
                overall_score=data.overall_score,
                summary=data.summary,
            )
            db.add(evaluation)

        db.commit()

        return {"message": "Evaluation saved successfully."}

    finally:
        db.close()


@router.post("/start")
async def start_interview(
    data: InterviewStartRequest,
     current_user=Depends(
        get_current_user
    )

):
    db = SessionLocal()

    jd = (
        db.query(JobDescription)
        .filter(JobDescription.id == data.jd_id)
        .first()
    )

    if not jd:
        db.close()
        raise HTTPException(
            status_code=404,
            detail="Job Description not found"
        )

    existing = (
        db.query(Interview)
        .filter(
            Interview.user_id == current_user["user_id"],
            Interview.jd_id == data.jd_id,
            Interview.status.in_(["active", "completed"]),
        )
        .first()
    )

    if existing:
        db.close()
        if existing.status == "completed":
            raise HTTPException(
                status_code=409,
                detail="You have already completed an interview for this position."
            )
        raise HTTPException(
            status_code=409,
            detail="You already have an interview in progress for this position."
        )

    interview = Interview(
       user_id = current_user["user_id"],
        resume_id=data.resume_id,
        jd_id=data.jd_id,
        company_id=jd.company_id,
        status = "active"
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

    db.close()
    return {
    "interview_id": interview_id,
    "livekit_token": livekit["token"],
    "room_name": livekit["room_name"]
}

@router.post("/finish/{interview_id}")
def finish_interview(
    interview_id: int,
    data: FinishInterviewRequest,
    current_user=Depends(get_current_user)
):
    db = SessionLocal()

    try:
        interview = (
            db.query(Interview)
            .filter(
                Interview.id == interview_id,
                Interview.user_id == current_user["user_id"]
            )
            .first()
        )

        if interview is None:
            raise HTTPException(
                status_code=404,
                detail="Interview not found"
            )

        for msg in data.transcript:
            db.add(
                Message(
                    interview_id=interview.id,
                    role=msg.speaker,
                    content=msg.text,
                    timestamp=msg.timestamp,
                )
            )

        interview.status = "completed"

        db.commit()

        return {
            "message": "Interview completed successfully."
        }

    finally:
        db.close()
@router.get("/my-interviews")
def list_my_interviews(
    current_user=Depends(get_current_user)
):
    db = SessionLocal()

    try:
        interviews = (
            db.query(Interview)
            .filter(Interview.user_id == current_user["user_id"])
            .all()
        )

        return [
            {
                "jd_id": interview.jd_id,
                "status": interview.status,
            }
            for interview in interviews
        ]

    finally:
        db.close()


@router.get("/results")
def list_results(
    current_user=Depends(require_admin)
):
    db = SessionLocal()

    try:
        rows = (
            db.query(Interview, JobDescription, User)
            .join(JobDescription, Interview.jd_id == JobDescription.id)
            .join(User, Interview.user_id == User.id)
            .filter(Interview.company_id == current_user["company_id"])
            .order_by(Interview.created_at.desc())
            .all()
        )

        return [
            {
                "interview_id": interview.id,
                "candidate_email": user.email,
                "jd_title": jd.title,
                "status": interview.status,
                "created_at": interview.created_at,
            }
            for interview, jd, user in rows
        ]

    finally:
        db.close()


@router.get("/result/{interview_id}")
def get_result(
    interview_id: int,
    current_user=Depends(require_admin)
):
    db = SessionLocal()

    try:
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

        if interview.company_id != current_user["company_id"]:
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to view this interview"
            )

        evaluation = (
            db.query(InterviewEvaluation)
            .filter(InterviewEvaluation.interview_id == interview_id)
            .first()
        )

        messages = (
            db.query(Message)
            .filter(Message.interview_id == interview_id)
            .order_by(Message.id)
            .all()
        )

        return {
            "interview_id": interview.id,
            "status": interview.status,
            "evaluation": {
                "technical_knowledge": evaluation.technical_knowledge,
                "problem_solving": evaluation.problem_solving,
                "communication": evaluation.communication,
                "relevance_to_jd": evaluation.relevance_to_jd,
                "overall_score": evaluation.overall_score,
                "summary": evaluation.summary,
            } if evaluation else None,
            "transcript": [
                {
                    "role": msg.role,
                    "content": msg.content,
                    "timestamp": msg.timestamp,
                }
                for msg in messages
            ],
        }

    finally:
        db.close()

from fastapi import APIRouter, HTTPException

from database import SessionLocal
from models import JobDescription
from schemas import (
    JobDescriptionRequest,
    JobDescriptionResponse
)

router = APIRouter()

@router.get("/")
def home():
    return {"message": "Hello"}


# CREATE
@router.post("/admin/jd")
def create_jd(jd: JobDescriptionRequest):

    db = SessionLocal()

    try:
        job = JobDescription(
            title=jd.title,
            description=jd.description,
            skills=jd.skills
        )

        db.add(job)
        db.commit()
        db.refresh(job)

        return {
            "status": "success",
            "job": job
        }

    finally:
        db.close()


# READ ALL
@router.get(
    "/jd",
    response_model=list[JobDescriptionResponse]
)
def get_jd():

    db = SessionLocal()

    try:
        jobs = db.query(JobDescription).all()
        return jobs

    finally:
        db.close()


# READ ONE
@router.get(
    "/jd/{id}",
    response_model=JobDescriptionResponse
)
def get_single_jd(id: int):

    db = SessionLocal()

    try:
        job = (
            db.query(JobDescription)
            .filter(JobDescription.id == id)
            .first()
        )

        if not job:
            raise HTTPException(
                status_code=404,
                detail="Job Description not found"
            )

        return job

    finally:
        db.close()


# UPDATE
@router.put(
    "/jd/{id}",
    response_model=JobDescriptionResponse
)
def update_jd(
    id: int,
    jd: JobDescriptionRequest
):

    db = SessionLocal()

    try:
        job = (
            db.query(JobDescription)
            .filter(JobDescription.id == id)
            .first()
        )

        if not job:
            raise HTTPException(
                status_code=404,
                detail="Job Description not found"
            )

        job.title = jd.title
        job.description = jd.description
        job.skills = jd.skills

        db.commit()
        db.refresh(job)

        return job

    finally:
        db.close()


# DELETE
@router.delete("/jd/{id}")
def delete_jd(id: int):

    db = SessionLocal()

    try:
        job = (
            db.query(JobDescription)
            .filter(JobDescription.id == id)
            .first()
        )

        if not job:
            raise HTTPException(
                status_code=404,
                detail="Job Description not found"
            )

        db.delete(job)
        db.commit()

        return {
            "status": "success",
            "message": f"JD {id} deleted"
        }

    finally:
        db.close()


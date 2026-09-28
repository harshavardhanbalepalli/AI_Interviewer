from fastapi import (
    APIRouter,
    HTTPException,
    Depends
)
let /from sqlalchemy.orm import Session

from database import get_db

from models import JobDescription, Company

from schemas import (
    JobDescriptionRequest,
    JobDescriptionResponse
)

from auth.dependencies import (
    require_admin
)

router = APIRouter()


@router.get("/")
def home():
    return {
        "message": "Hello"
    }


# CREATE JD (ADMIN ONLY)
@router.post("/jd")
def create_jd(
    jd: JobDescriptionRequest,
    current_user=Depends(
        require_admin
    ),
    db: Session = Depends(get_db)
):

    company = (
        db.query(Company)
        .filter(Company.id == current_user["company_id"])
        .first()
    )

    job = JobDescription(
        title=jd.title,
        description=jd.description,
        skills=jd.skills,
        company_id=company.id,
        company_name=company.name
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    return {
        "status": "success",
        "job": job
    }


# READ ALL JDS (PUBLIC)
@router.get(
    "/jd",
    response_model=list[
        JobDescriptionResponse
    ]
)
def get_jd(db: Session = Depends(get_db)):

    jobs = (
        db.query(
            JobDescription
        )
        .all()
    )

    return jobs


# READ SINGLE JD (PUBLIC)
@router.get(
    "/jd/{id}",
    response_model=
    JobDescriptionResponse
)
def get_single_jd(
    id: int,
    db: Session = Depends(get_db)
):

    job = (
        db.query(
            JobDescription
        )
        .filter(
            JobDescription.id == id
        )
        .first()
    )

    if not job:

        raise HTTPException(
            status_code=404,
            detail=
            "Job Description not found"
        )

    return job


# UPDATE JD (ADMIN ONLY)
@router.put(
    "/jd/{id}",
    response_model=
    JobDescriptionResponse
)
def update_jd(
    id: int,
    jd: JobDescriptionRequest,

    current_user=Depends(
        require_admin
    ),
    db: Session = Depends(get_db)
):

    job = (
        db.query(
            JobDescription
        )
        .filter(
            JobDescription.id == id
        )
        .first()
    )

    if not job:

        raise HTTPException(
            status_code=404,
            detail=
            "Job Description not found"
        )

    if job.company_id != current_user["company_id"]:

        raise HTTPException(
            status_code=403,
            detail=
            "You do not have permission to modify this Job Description"
        )

    job.title = jd.title
    job.description = (
        jd.description
    )
    job.skills = jd.skills

    db.commit()
    db.refresh(job)

    return job


# DELETE JD (ADMIN ONLY)
@router.delete(
    "/jd/{id}"
)
def delete_jd(
    id: int,

    current_user=Depends(
        require_admin
    ),
    db: Session = Depends(get_db)
):

    job = (
        db.query(
            JobDescription
        )
        .filter(
            JobDescription.id == id
        )
        .first()
    )

    if not job:

        raise HTTPException(
            status_code=404,
            detail=
            "Job Description not found"
        )

    if job.company_id != current_user["company_id"]:

        raise HTTPException(
            status_code=403,
            detail=
            "You do not have permission to delete this Job Description"
        )

    db.delete(job)

    db.commit()

    return {
        "status": "success",
        "message":
        f"JD {id} deleted"
    }

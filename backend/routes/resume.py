import os

import cloudinary
import cloudinary.uploader
import fitz
from dotenv import load_dotenv

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Resume
from auth.dependencies import get_current_user
from schemas import ResumeResponse

load_dotenv()

router = APIRouter()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)


def upload_resume_file(contents: bytes, user_id: int) -> str:
    result = cloudinary.uploader.upload(
        contents,
        resource_type="raw",
        public_id=f"resumes/user_{user_id}",
        overwrite=True,
    )
    return result["secure_url"]


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # One PDF per user
    contents = await file.read()

    pdf = fitz.open(stream=contents, filetype="pdf")

    extracted_text = ""

    for page in pdf:
        extracted_text += page.get_text()

    pdf.close()

    file_path = upload_resume_file(contents, current_user["user_id"])

    print("Resume text extracted successfully")

    existing_resume = (
        db.query(Resume)
        .filter(
            Resume.user_id == current_user["user_id"]
        )
        .first()
    )

    if existing_resume:
        existing_resume.file_path = file_path
        existing_resume.resume_text = extracted_text

        db.commit()
        db.refresh(existing_resume)

        print("Resume updated")

        return {
            "resume_id": existing_resume.id,
            "status": "updated"
        }

    resume = Resume(
        user_id=current_user["user_id"],
        file_path=file_path,
        resume_text=extracted_text
    )

    db.add(resume)
    db.commit()
    db.refresh(resume)

    print("Resume uploaded")

    return {
        "resume_id": resume.id,
        "status": "uploaded"
    }


@router.get("", response_model=ResumeResponse)
def get_resume(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = (
        db.query(Resume)
        .filter(
            Resume.user_id == current_user["user_id"]
        )
        .first()
    )

    if resume is None:
        raise HTTPException(
            status_code=404,
            detail="Resume not found"
        )

    return resume
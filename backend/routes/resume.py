import fitz
import os

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from database import SessionLocal
from models import Resume
from auth.dependencies import get_current_user
from schemas import ResumeResponse

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):
    db = SessionLocal()

    try:
        # One PDF per user
        file_path = os.path.join(
            UPLOAD_DIR,
            f"user_{current_user['user_id']}.pdf"
        )

        contents = await file.read()

        with open(file_path, "wb") as f:
            f.write(contents)

        pdf = fitz.open(file_path)

        extracted_text = ""

        for page in pdf:
            extracted_text += page.get_text()

        pdf.close()

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

    finally:
        db.close()


@router.get("", response_model=ResumeResponse)
def get_resume(
    current_user=Depends(get_current_user)
):
    db = SessionLocal()

    try:
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

    finally:
        db.close()
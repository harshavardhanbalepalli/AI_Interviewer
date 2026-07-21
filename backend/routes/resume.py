import fitz #used to read pdf's
import os #for file path's and folders

from fastapi import APIRouter, UploadFile, File, Depends
from database import SessionLocal
from models import Resume
from auth.dependencies import get_current_user
router = APIRouter()

UPLOAD_DIR = "uploads" # creates a new upload folder

os.makedirs(UPLOAD_DIR, exist_ok=True) # if it exists then do nothing


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...), #accept upload file
    current_user=Depends(get_current_user) 
):
    db = SessionLocal()

    try:

        file_path = os.path.join(
            UPLOAD_DIR,
            file.filename
        )

        contents = await file.read() # reads entire pdf into memory

        with open(file_path, "wb") as f: # save pdf wb--> write binary because pdf isn't text
            f.write(contents)# write bytes to disk

        pdf = fitz.open(file_path) #loads pdf

        extracted_text = ""

        for page in pdf:
            extracted_text += page.get_text()

        pdf.close()
        print("Resume text extracted Successfully")
        resume = Resume(
            user_id=current_user["user_id"],
            file_path=file_path,
            resume_text=extracted_text
        )  # creates an orm object

        db.add(resume)
        db.commit()
        db.refresh(resume)
        print("received resume")
        return {
            "resume_id": resume.id,
            "status": "uploaded"
        }

    finally:
        db.close()


#currently extracting all the text from the resume we have to make it compact
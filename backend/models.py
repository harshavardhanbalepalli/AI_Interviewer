from sqlalchemy import Column, Integer, String
from database import Base

class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    skills = Column(String)

from sqlalchemy import Column, Integer, String, Text

class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    file_path = Column(String)
    resume_text = Column(Text)
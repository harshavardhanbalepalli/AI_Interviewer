from sqlalchemy import Column, Integer, String, Text, ForeignKey
from database import Base

class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    skills = Column(String)

class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    file_path = Column(String)
    resume_text = Column(Text)



class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)

    resume_id = Column(
        Integer,
        ForeignKey("resumes.id") # foreign Key -->Only valid resume ids allowed
    )

    jd_id = Column(
        Integer,
        ForeignKey("job_descriptions.id")
    )

    status = Column(String, default="active")

class Message(Base):
    __tablename__ = "messages"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    interview_id = Column(
        Integer,
        ForeignKey("interviews.id")
    )

    role = Column(String)

    content = Column(Text)

class InterviewEvaluation(Base):
    __tablename__ = "interview_evaluations"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    interview_id = Column(
        Integer,
        ForeignKey("interviews.id")
    )

    feedback = Column(Text)
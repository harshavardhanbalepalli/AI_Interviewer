from sqlalchemy import Column, Integer, String, Text, ForeignKey, BigInteger, DateTime, func
from database import Base

class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    skills = Column(String)
    company_id = Column(
        Integer,
        ForeignKey("companies.id"),
        nullable=False
    )
    company_name = Column(String, nullable=False)

class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
    Integer,
    ForeignKey("users.id"),
    nullable=False
)
    file_path = Column(String)
    resume_text = Column(Text)



class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
    Integer,
    ForeignKey("users.id"),
    nullable=False
)
    resume_id = Column(
        Integer,
        ForeignKey("resumes.id") # foreign Key -->Only valid resume ids allowed
    )

    jd_id = Column(
        Integer,
        ForeignKey("job_descriptions.id")
    )

    company_id = Column(
        Integer,
        ForeignKey("companies.id"),
        nullable=False
    )

    status = Column(String, default="pending")

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

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
    timestamp=Column(BigInteger)
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

    technical_knowledge = Column(Integer)
    problem_solving = Column(Integer)
    communication = Column(Integer)
    relevance_to_jd = Column(Integer)
    overall_score = Column(Integer)
    summary = Column(Text)


class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )
    email = Column(
        String,
        unique=True,
        nullable=False
    )
    password_hash = Column(
        String,
        nullable=False
    )
    role = Column(
        String,
        default="candidate"
    )
    company_id = Column(
        Integer,
        ForeignKey("companies.id"),
        nullable=True
    )
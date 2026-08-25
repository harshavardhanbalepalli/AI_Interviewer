from pydantic import BaseModel


class JobDescriptionRequest(BaseModel):
    title: str
    description: str
    skills: str


class JobDescriptionResponse(BaseModel):
    id: int
    title: str
    description: str
    skills: str
    company_id: int
    company_name: str

    model_config = {
        "from_attributes": True
    }#---> what this does??
    # when we do return resume we ared returning sqlAlchemy orm object not a dictionary where as pydantic expects somehting like{"id":1,
    # "file_path": "uploads/resume.pdf"} so due to the abouve line tells pydantic to read the values from the objects attributes so it automaticallu converts into json

class InterviewStartRequest(BaseModel):
    resume_id: int
    jd_id: int

class AnswerRequest(BaseModel):
    interview_id: int
    answer: str

class EndInterview(BaseModel):
    interview_id: int
    
class RegisterRequest(BaseModel):
    email: str
    password: str
    role: str = "candidate"
    company_name: str | None = None


class LoginRequest(BaseModel):
    email: str
    password: str

class ResumeResponse(BaseModel):
    id: int
    file_path: str

    model_config = {
        "from_attributes": True
    }

class TranscriptMessage(BaseModel):
    speaker: str
    text: str
    timestamp: int


class FinishInterviewRequest(BaseModel):
    transcript: list[TranscriptMessage]


class EvaluationSubmitRequest(BaseModel):
    technical_knowledge: int
    problem_solving: int
    communication: int
    relevance_to_jd: int
    overall_score: int
    summary: str
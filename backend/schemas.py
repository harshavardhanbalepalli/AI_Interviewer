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

    model_config = {
        "from_attributes": True
    }#---> what this does??

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


class LoginRequest(BaseModel):
    email: str
    password: str
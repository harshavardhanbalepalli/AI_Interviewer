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
    answer: str
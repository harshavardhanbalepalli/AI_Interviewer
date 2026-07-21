from fastapi import FastAPI

from database import Base, engine
from routes.admin import router as admin_router
from routes.resume import router as resume_router
from routes.interview import router as interview_router
from fastapi.middleware.cors import CORSMiddleware
from routes import auth

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    admin_router,
    prefix="/admin",
    tags=["Admin"]
)
app.include_router(
    resume_router,
    prefix="/resume",
    tags=["Resume"]
)

app.include_router(
    interview_router,
    prefix="/interview",
    tags=["Interview"]
)

app.include_router(
    auth.router,
    prefix="/auth",
    tags=["Auth"]
)

@app.get("/")
def home():
    return {"message": "Hello"}
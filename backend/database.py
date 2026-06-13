from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base # sql alchemy generates sql for us

DATABASE_URL = "postgresql://localhost/ai_interviewer"

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()
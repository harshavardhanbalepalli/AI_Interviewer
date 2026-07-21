from passlib.context import CryptContext
import os
from datetime import (
    datetime,
    timedelta
)
from jose import jwt
from dotenv import load_dotenv
from pathlib import Path

BASE_DIR = (
    Path(__file__)
    .resolve()
    .parent
    .parent
)

load_dotenv(
    BASE_DIR.parent / ".env"
)
load_dotenv()
print("SECURITY FILE LOADED")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"#--> what this mean:If one day you migrate from bcrypt to a newer hashing algorithm, Passlib can automatically recognize old hashes and help transition users.
)


def hash_password(
    password: str
):
    return pwd_context.hash(
        password
    )


def verify_password(
    plain_password,
    hashed_password
):
    return pwd_context.verify(
        plain_password,
        hashed_password
    )

def create_access_token(
    data: dict
):

    payload = data.copy()

    payload["exp"] = (
        datetime.utcnow()
        + timedelta(hours=24)
    )

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token

def decode_access_token(
    token: str
):
    payload = jwt.decode(
        token,
        SECRET_KEY,
        algorithms=[ALGORITHM]
    )

    return payload
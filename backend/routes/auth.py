from fastapi import APIRouter, HTTPException

from database import SessionLocal

from models import User
from auth.security import (
    decode_access_token
)
from schemas import RegisterRequest, LoginRequest
from auth.security import (
    hash_password,
    verify_password,
    create_access_token
)
from fastapi import Depends

from auth.dependencies import (
    get_current_user
)
router = APIRouter()

@router.get("/")
def home():
    return {
        "message": "auth works"
    }

@router.post("/register")
def register(
    data: RegisterRequest
):
    db = SessionLocal()
    # checking if user already exists in the db
    existing_user = (
    db.query(User)
    .filter(
        User.email == data.email
    )
    .first()
)
    if existing_user:
      raise HTTPException(
        status_code=400,
        detail="Email already registered"
    )
    print(data.password)
    print(len(data.password))
    hashed_password = hash_password(
    data.password
)
    user = User(
    email=data.email,
    password_hash=hashed_password
)
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({
        "user_id": user.id,
        "email": user.email,
        "role": user.role
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }
@router.post("/login")
def login(
    data: LoginRequest
):

    db = SessionLocal()

    user = (
        db.query(User)
        .filter(
            User.email == data.email
        )
        .first()
    )

    if not user:

        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    if not verify_password(
        data.password,
        user.password_hash
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    token = create_access_token(
    {
        "user_id": user.id,
        "email": user.email,
        "role": user.role
    }
)
    return {
    "access_token": token,
    "token_type": "bearer"
}

@router.get("/me")
def me(
    current_user =
    Depends(
        get_current_user
    )
):
    return current_user
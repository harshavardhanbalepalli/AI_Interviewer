from fastapi import APIRouter, HTTPException

from database import SessionLocal

from models import User, Company
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

    if data.role not in ("candidate", "admin"):
        raise HTTPException(
            status_code=400,
            detail="Role must be 'candidate' or 'admin'"
        )

    company_id = None

    if data.role == "admin":
        if not data.company_name:
            raise HTTPException(
                status_code=400,
                detail="company_name is required for admin accounts"
            )

        company = (
            db.query(Company)
            .filter(Company.name == data.company_name)
            .first()
        )

        if not company:
            company = Company(name=data.company_name)
            db.add(company)
            db.commit()
            db.refresh(company)

        company_id = company.id

    hashed_password = hash_password(
    data.password
)
    user = User(
    email=data.email,
    password_hash=hashed_password,
    role=data.role,
    company_id=company_id
)
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
        "company_id": user.company_id
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
        "role": user.role,
        "company_id": user.company_id
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
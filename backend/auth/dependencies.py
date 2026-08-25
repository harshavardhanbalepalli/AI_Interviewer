from fastapi.security import (
    HTTPBearer
)

from auth.security import (
    decode_access_token
)

from fastapi import (
    Depends,
    HTTPException
)
security = HTTPBearer()
from fastapi import Header, HTTPException
import os

AGENT_API_KEY = os.getenv("AGENT_API_KEY")


def verify_agent(x_agent_key: str = Header(...)):
    if x_agent_key != AGENT_API_KEY:
        raise HTTPException(
            status_code=401,
            detail="Invalid agent key"
        )

def get_current_user(
    credentials =
    Depends(security)
):

    token = credentials.credentials
    print("Credentials:", credentials)
    print("Token:", repr(credentials.credentials))
    payload = decode_access_token(
        token
    )

    return payload

def require_admin(
    current_user =
    Depends(
        get_current_user
    )
):

    if (
        current_user["role"]
        != "admin"
    ):

        raise HTTPException(
            status_code=403,
            detail="Admins only"
        )

    return current_user
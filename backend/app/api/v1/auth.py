"""
Auth Router — User authentication & JWT token issuance.
"""

from fastapi import APIRouter, HTTPException, Depends, status
from backend.app.schemas.schemas import UserLogin, Token
from backend.app.core.security import verify_password, hash_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Pre-configured administrative users for development/demonstration
DEMO_USERS = {
    "admin@weather.gov.in": {
        "user_id": "usr_admin_01",
        "email": "admin@weather.gov.in",
        "name": "Director General (Weather Intelligence)",
        "password_hash": hash_password("admin123"),
        "role": "Super Admin"
    },
    "verifier@weather.gov.in": {
        "user_id": "usr_verifier_01",
        "email": "verifier@weather.gov.in",
        "name": "Senior Verification Specialist",
        "password_hash": hash_password("verifier123"),
        "role": "Verifier"
    },
    "analyst@weather.gov.in": {
        "user_id": "usr_analyst_01",
        "email": "analyst@weather.gov.in",
        "name": "Senior Meteorological Analyst",
        "password_hash": hash_password("analyst123"),
        "role": "Analyst"
    }
}


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    user = DEMO_USERS.get(credentials.email)
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password credential",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user["user_id"], "email": user["email"], "name": user["name"], "role": user["role"]}
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        role=user["role"],
        name=user["name"]
    )

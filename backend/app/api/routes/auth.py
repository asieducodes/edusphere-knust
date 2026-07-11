from fastapi import APIRouter, HTTPException, status

from app.core.config import settings
from app.schemas.auth import LoginRequest, RefreshRequest, SignupRequest, TokenResponse, VerifyEmailRequest

router = APIRouter()


def is_valid_knust_email(email: str) -> bool:
    domain = email.split("@")[-1].lower()
    return domain in settings.ALLOWED_EMAIL_DOMAINS


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: SignupRequest):
    if not is_valid_knust_email(payload.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only KNUST email addresses (@knust.edu.gh or @st.knust.edu.gh) are allowed.",
        )
    # TODO: hash password, create user row, send verification email, issue tokens
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    # TODO: verify credentials against DB, issue JWT access + refresh tokens
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.post("/verify-email")
async def verify_email(payload: VerifyEmailRequest):
    # TODO: validate verification code/token, mark user as verified
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.post("/verify-email/resend")
async def resend_verification_email(email: str):
    # TODO: generate a new verification code and send it
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.post("/forgot-password")
async def forgot_password(email: str):
    # TODO: generate reset token, send reset email
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(payload: RefreshRequest):
    # TODO: validate refresh token, issue a new access/refresh token pair
    raise HTTPException(status_code=501, detail="Not implemented yet")

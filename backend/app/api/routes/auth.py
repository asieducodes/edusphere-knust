from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_verification_code,
    hash_password,
    verify_password,
)
from app.models.profile import Profile
from app.schemas.auth import LoginRequest, RefreshRequest, SignupRequest, VerifyEmailRequest
from app.schemas.response import success

router = APIRouter()


def is_valid_knust_email(email: str) -> bool:
    domain = email.split("@")[-1].lower()
    return domain in settings.ALLOWED_EMAIL_DOMAINS


def _user_public_dict(user: Profile) -> dict:
    return {
        "id": str(user.id),
        "full_name": user.full_name,
        "email": user.email,
        "avatar_url": user.avatar_url,
        "programme": user.programme,
        "level": user.level,
        "role": user.role,
        "is_verified": user.is_verified,
    }


@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(payload: SignupRequest, db: AsyncSession = Depends(get_db)):
    if not is_valid_knust_email(payload.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only KNUST email addresses (@knust.edu.gh or @st.knust.edu.gh) are allowed.",
        )

    existing = await db.execute(select(Profile).where(Profile.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists.")

    user = Profile(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        programme=payload.programme,
        level=payload.level,
        role="student",
        is_verified=False,
        verification_code=generate_verification_code(),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # TODO: actually send `user.verification_code` via email (e.g. SendGrid/SMTP).
    # Logged here for now so signup is testable end-to-end without email infra.
    print(f"[DEV] Verification code for {user.email}: {user.verification_code}")

    return success(data={"user": _user_public_dict(user)}, message="Account created. Please verify your email.")


@router.post("/login")
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Profile).where(Profile.email == payload.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password.")
    if user.is_suspended:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This account has been suspended.")

    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))

    return success(
        data={
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": _user_public_dict(user),
        },
        message="Login successful",
    )


@router.post("/verify-email")
async def verify_email(payload: VerifyEmailRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Profile).where(Profile.email == payload.email))
    user = result.scalar_one_or_none()

    if not user or user.verification_code != payload.code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired verification code.")

    user.is_verified = True
    user.verification_code = None
    await db.commit()

    return success(message="Email verified successfully.")


@router.post("/verify-email/resend")
async def resend_verification_email(email: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Profile).where(Profile.email == email))
    user = result.scalar_one_or_none()

    if not user:
        # Don't reveal whether the email exists — same response either way.
        return success(message="If that account exists, a new code has been sent.")

    user.verification_code = generate_verification_code()
    await db.commit()
    print(f"[DEV] New verification code for {user.email}: {user.verification_code}")

    return success(message="If that account exists, a new code has been sent.")


@router.post("/forgot-password")
async def forgot_password(email: str, db: AsyncSession = Depends(get_db)):
    # TODO: generate a real password-reset token and send it via email.
    # Kept as a no-op success response regardless of whether the email exists,
    # to avoid leaking which emails are registered.
    return success(message="If that account exists, a password reset link has been sent.")


@router.post("/refresh")
async def refresh_token(payload: RefreshRequest, db: AsyncSession = Depends(get_db)):
    decoded = decode_token(payload.refresh_token)
    if not decoded or decoded.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token.")

    user_id = decoded.get("sub")
    result = await db.execute(select(Profile).where(Profile.id == user_id))
    user = result.scalar_one_or_none()
    if not user or user.is_suspended:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token.")

    return success(
        data={
            "access_token": create_access_token(str(user.id)),
            "refresh_token": create_refresh_token(str(user.id)),
            "token_type": "bearer",
        },
        message="Token refreshed",
    )
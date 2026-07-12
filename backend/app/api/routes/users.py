from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.profile import Profile
from app.schemas.response import success

router = APIRouter()


def _user_full_dict(user: Profile) -> dict:
    return {
        "id": str(user.id),
        "full_name": user.full_name,
        "email": user.email,
        "avatar_url": user.avatar_url,
        "bio": user.bio,
        "programme": user.programme,
        "department": user.department.name if user.department else None,
        "college": user.department.college if user.department else None,
        "level": user.level,
        "role": user.role,
        "is_verified": user.is_verified,
        "is_suspended": user.is_suspended,
        "rating_average": None,  # TODO: compute from ratings table once it exists
        "rating_count": 0,
        "created_at": user.created_at.isoformat(),
        "updated_at": user.updated_at.isoformat(),
    }


@router.get("/me")
async def get_current_user_profile(current_user: Profile = Depends(get_current_user)):
    return success(data=_user_full_dict(current_user))


@router.patch("/me")
async def update_current_user_profile(
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # TODO: accept an UpdateProfileRequest body and apply changes (full_name, bio, programme, etc.)
    await db.commit()
    return success(data=_user_full_dict(current_user), message="Profile updated")


@router.get("/{user_id}")
async def get_user_by_id(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Profile).where(Profile.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return success(data=_user_full_dict(user))
from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.get("/me")
async def get_current_user_profile():
    # TODO: return the authenticated user's profile (requires auth dependency)
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.patch("/me")
async def update_current_user_profile():
    # TODO: update the authenticated user's profile fields
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/{user_id}")
async def get_user_by_id(user_id: str):
    # TODO: return a public profile view for another user (e.g. a group host)
    raise HTTPException(status_code=501, detail="Not implemented yet")

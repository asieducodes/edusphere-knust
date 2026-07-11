from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.get("/")
async def list_users():
    # TODO: implement — see docs/BACKEND_SETUP.md for schema
    raise HTTPException(status_code=501, detail="Not implemented yet")

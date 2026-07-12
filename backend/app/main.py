from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.core.config import settings
from app.schemas.response import success
from app.api.routes import auth, users, groups, resources, sessions, ratings, notifications

app = FastAPI(
    title="EduSphere API",
    description="Backend API for EduSphere — campus study group and resource finder for KNUST students.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Wraps every HTTPException in the standard {success, message, error} envelope,
    so route handlers can keep raising plain HTTPException and still get a
    consistent response shape across the whole API."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": "Request failed", "error": exc.detail},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"success": False, "message": "Validation error", "error": exc.errors()},
    )


app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(groups.router, prefix="/api/groups", tags=["groups"])
app.include_router(resources.router, prefix="/api/resources", tags=["resources"])
app.include_router(sessions.router, prefix="/api/sessions", tags=["sessions"])
app.include_router(ratings.router, prefix="/api/ratings", tags=["ratings"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])


@app.get("/health", tags=["health"])
async def health_check():
    return success(data={"status": "ok"}, message="Service is healthy")
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
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

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(groups.router, prefix="/api/groups", tags=["groups"])
app.include_router(resources.router, prefix="/api/resources", tags=["resources"])
app.include_router(sessions.router, prefix="/api/sessions", tags=["sessions"])
app.include_router(ratings.router, prefix="/api/ratings", tags=["ratings"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])


@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok"}

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App
    ENV: str = "development"
    SECRET_KEY: str = "change-me"
    CORS_ORIGINS: list[str] = ["*"]

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/edusphere"

    # Auth
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    JWT_ALGORITHM: str = "HS256"

    # KNUST email domains allowed to register
    ALLOWED_EMAIL_DOMAINS: list[str] = ["knust.edu.gh", "st.knust.edu.gh"]

    # Cloudinary (file storage for past questions / notes / avatars)
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""


settings = Settings()

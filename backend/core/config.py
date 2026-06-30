from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    API_PREFIX: str = "/api"
    BACKEND_HOST: str = "127.0.0.1"
    BACKEND_PORT: int = 8000

    DATABASE_URL: str
    SUPABASE_URL: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str

    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    MAX_UPLOAD_SIZE_MB: int = 10
    TEMP_FILE_RETENTION_DAYS: int = 30

    ADMIN_EMAIL: str = "admin@tagon.com"
    ADMIN_PASSWORD: str = "admin123"
    ADMIN_NAME: str = "TagOn Admin"

    QR_IMAGE_URL: str = "https://res.cloudinary.com/demo/image/upload/v1/tagon/qr-code.png"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    def validate(self) -> list[str]:
        errors = []
        required = {
            "DATABASE_URL": self.DATABASE_URL,
            "SECRET_KEY": self.SECRET_KEY,
            "CLOUDINARY_CLOUD_NAME": self.CLOUDINARY_CLOUD_NAME,
            "CLOUDINARY_API_KEY": self.CLOUDINARY_API_KEY,
            "CLOUDINARY_API_SECRET": self.CLOUDINARY_API_SECRET,
        }
        for name, value in required.items():
            if not value or value == "change-me":
                errors.append(f"{name} is not set")
        if self.is_production:
            if self.DEBUG:
                errors.append("DEBUG must be False in production")
            if "localhost" in self.ALLOWED_ORIGINS or "127.0.0.1" in self.ALLOWED_ORIGINS:
                errors.append("ALLOWED_ORIGINS contains localhost in production")
            if len(self.SECRET_KEY) < 32:
                errors.append("SECRET_KEY must be at least 32 characters in production")
        return errors

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "MitraCare Backend API"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "mitracare-super-secret-key-change-in-production-2026"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/mitracare"
    ALLOWED_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8081", "*"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()

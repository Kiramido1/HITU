"""
Application settings.

Every sensitive value is loaded from environment variables or Docker secret
files. The repository intentionally ships no working credentials.
"""
from functools import lru_cache
import os
from pathlib import Path
from typing import Any, List, Optional

from pydantic import AliasChoices, Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def _read_secret_file(path: str) -> str:
    return Path(path).read_text(encoding="utf-8").strip()


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
        populate_by_name=True,
    )

    # Application
    APP_NAME: str = "HITU AI Platform"
    APP_VERSION: str = "2.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    # Security
    JWT_SECRET: str = Field(
        validation_alias=AliasChoices("JWT_SECRET", "SECRET_KEY"),
        min_length=32,
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Supabase and PostgreSQL
    DATABASE_URL: str = Field(min_length=1)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE_SECONDS: int = 1800

    # Redis and AI engine
    REDIS_URL: str = "redis://localhost:6379/0"
    OLLAMA_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "qwen2.5-coder:7b-instruct-q4_K_M"

    # CORS
    CORS_ORIGINS: str = "http://localhost,http://localhost:5173"

    # File uploads
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE_MB: int = 50
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024
    ALLOWED_EXTENSIONS: str = "pdf,docx,pptx,xlsx,csv,zip,mp4,png,jpg,jpeg"
    ALLOWED_FILE_TYPES: str = ".pdf,.docx,.pptx,.xlsx,.csv,.zip,.mp4,.png,.jpg,.jpeg"

    # Rate limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_PUBLIC: str = "100/minute"
    RATE_LIMIT_AUTH: str = "20/minute"
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 60

    # Pagination and cache
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100
    CACHE_ENABLED: bool = True
    CACHE_TTL: int = 3600

    # Optional email delivery
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAIL_FROM: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def load_docker_secret_files(cls, data: Any) -> Any:
        values = dict(data or {})
        for name in (
            "DATABASE_URL",
            "JWT_SECRET",
            "SUPABASE_ANON_KEY",
            "SUPABASE_SERVICE_ROLE_KEY",
            "REDIS_URL",
            "SMTP_PASSWORD",
        ):
            file_path = os.getenv(f"{name}_FILE")
            if file_path and not values.get(name):
                values[name] = _read_secret_file(file_path)
        if values.get("SECRET_KEY") and not values.get("JWT_SECRET"):
            values["JWT_SECRET"] = values["SECRET_KEY"]
        return values

    @field_validator("ENVIRONMENT")
    @classmethod
    def normalize_environment(cls, value: str) -> str:
        return value.lower().strip()

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug_flag(cls, value: Any) -> Any:
        if isinstance(value, str):
            normalized = value.lower().strip()
            if normalized in {"release", "prod", "production", "off", "no", "false", "0"}:
                return False
            if normalized in {"debug", "dev", "development", "on", "yes", "true", "1"}:
                return True
        return value

    @field_validator("DATABASE_URL")
    @classmethod
    def validate_postgres_url(cls, value: str) -> str:
        if not value.startswith(("postgresql://", "postgresql+asyncpg://", "postgresql+psycopg2://")):
            raise ValueError("DATABASE_URL must be a PostgreSQL connection string")
        return value

    @property
    def SECRET_KEY(self) -> str:
        """Backward-compatible alias used by older auth helpers."""
        return self.JWT_SECRET

    @property
    def ASYNC_DATABASE_URL(self) -> str:
        if self.DATABASE_URL.startswith("postgresql+asyncpg://"):
            return self.DATABASE_URL
        return (
            self.DATABASE_URL
            .replace("postgresql+psycopg2://", "postgresql+asyncpg://", 1)
            .replace("postgresql://", "postgresql+asyncpg://", 1)
        )

    @property
    def SYNC_DATABASE_URL(self) -> str:
        if self.DATABASE_URL.startswith("postgresql+asyncpg://"):
            return self.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql+psycopg2://", 1)
        return self.DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def allowed_extensions_set(self) -> set[str]:
        return {ext.strip().lower().lstrip(".") for ext in self.ALLOWED_EXTENSIONS.split(",") if ext.strip()}

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

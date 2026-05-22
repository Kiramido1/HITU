"""
Main FastAPI Application Entry Point.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.api.v1.router import api_router
from app.core.config import settings
from app.database.session import async_engine, create_tables
from app.middleware.error_handler import register_exception_handlers
from app.middleware.rate_limit import register_rate_limiter


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown tasks."""
    # In dev/testing, auto-create tables if Alembic isn't run
    if settings.DEBUG:
        await create_tables()

    yield
    # Shutdown (e.g. close redis connections here if added later)


def create_app() -> FastAPI:
    """Application factory."""
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="HITU Enterprise AI University Operating System",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
        lifespan=lifespan,
    )

    # 1. Security & CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 2. Rate Limiting Middleware
    register_rate_limiter(app)

    # 3. Exception Handlers
    register_exception_handlers(app)

    # 4. Routers
    app.include_router(api_router, prefix="/api/v1")

    # 5. Static Files (for uploads)
    import os
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

    return app


app = create_app()

@app.get("/api/v1/health", tags=["Health"])
async def health_check():
    """Service health check endpoint."""
    checks = {"database": "unknown"}
    async with async_engine.connect() as connection:
        await connection.execute(text("SELECT 1"))
        checks["database"] = "ok"

    return {
        "status": "ok",
        "environment": settings.ENVIRONMENT,
        "version": settings.APP_VERSION,
        "checks": checks,
    }

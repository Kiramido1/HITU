"""
Database session — async SQLAlchemy engine and session factory.
Uses asyncpg driver for high-performance async PostgreSQL access.
A sync SessionLocal is also provided for scripts (seed.py, alembic).
"""
from typing import AsyncGenerator

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.database.base import Base  # noqa: F401 — imported so Alembic sees all models

# ── Async Engine (production) ──────────────────────────────────────────────────
async_engine = create_async_engine(
    settings.ASYNC_DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_timeout=settings.DB_POOL_TIMEOUT,
    pool_recycle=settings.DB_POOL_RECYCLE_SECONDS,
)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)

# ── Sync Engine (seed scripts + alembic) ──────────────────────────────────────
sync_engine = create_engine(
    settings.SYNC_DATABASE_URL,
    pool_pre_ping=True,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_timeout=settings.DB_POOL_TIMEOUT,
    pool_recycle=settings.DB_POOL_RECYCLE_SECONDS,
    echo=settings.DEBUG,
)

SessionLocal = sessionmaker(bind=sync_engine, autoflush=False, autocommit=False)


# ── FastAPI dependency ─────────────────────────────────────────────────────────
async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# Legacy alias kept for compatibility
get_db = get_async_db


async def create_tables() -> None:
    """Create all tables (used in development lifespan)."""
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

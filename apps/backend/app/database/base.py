"""
Database Base — declarative base + timestamp mixin.
All models inherit from Base; auditable models inherit TimestampMixin.
"""
import uuid
from datetime import datetime
from sqlalchemy import DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """Single declarative base for all SQLAlchemy models."""
    pass


class TimestampMixin:
    """Adds created_at / updated_at columns with automatic server-side timestamps."""
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(),
        onupdate=func.now(), nullable=False
    )


class UUIDMixin:
    """UUID primary key mixin."""
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False
    )

"""Compatibility exports for older tests and imports."""
from app.database.base import Base, TimestampMixin, UUIDMixin

__all__ = ["Base", "TimestampMixin", "UUIDMixin"]

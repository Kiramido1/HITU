"""Operational platform models: audit logs, analytics snapshots, and exports."""
import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class AuditAction(str, enum.Enum):
    create = "create"
    read = "read"
    update = "update"
    delete = "delete"
    login = "login"
    logout = "logout"
    export = "export"
    schedule_generate = "schedule_generate"


class AnalyticsScope(str, enum.Enum):
    platform = "platform"
    department = "department"
    course = "course"
    hall = "hall"
    user = "user"
    schedule = "schedule"


class ExportType(str, enum.Enum):
    schedule_pdf = "schedule_pdf"
    schedule_excel = "schedule_excel"
    analytics_csv = "analytics_csv"
    audit_csv = "audit_csv"
    lms_report = "lms_report"


class ExportStatus(str, enum.Enum):
    queued = "queued"
    processing = "processing"
    completed = "completed"
    failed = "failed"
    expired = "expired"


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    actor_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    action: Mapped[AuditAction] = mapped_column(SAEnum(AuditAction, name="audit_action"), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(120), nullable=False)
    entity_id: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    before: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    after: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    metadata_json: Mapped[Optional[dict]] = mapped_column("metadata", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    actor: Mapped[Optional["User"]] = relationship("User", back_populates="audit_logs", foreign_keys=[actor_id])

    __table_args__ = (
        Index("ix_audit_logs_entity", "entity_type", "entity_id"),
        Index("ix_audit_logs_action_created", "action", "created_at"),
    )


class Analytics(Base, TimestampMixin):
    __tablename__ = "analytics"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scope: Mapped[AnalyticsScope] = mapped_column(
        SAEnum(AnalyticsScope, name="analytics_scope"),
        nullable=False,
    )
    scope_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True, index=True)
    metric_key: Mapped[str] = mapped_column(String(120), nullable=False)
    metric_value: Mapped[float] = mapped_column(nullable=False)
    dimensions: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    captured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        Index("ix_analytics_scope_metric", "scope", "metric_key"),
        Index("ix_analytics_captured", "captured_at"),
    )


class Export(Base, TimestampMixin):
    __tablename__ = "exports"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    requested_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    export_type: Mapped[ExportType] = mapped_column(SAEnum(ExportType, name="export_type"), nullable=False)
    status: Mapped[ExportStatus] = mapped_column(
        SAEnum(ExportStatus, name="export_status"),
        default=ExportStatus.queued,
        nullable=False,
    )
    file_url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    file_name: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    file_size: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    filters: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    requested_by: Mapped[Optional["User"]] = relationship(
        "User",
        back_populates="exports",
        foreign_keys=[requested_by_id],
    )

    __table_args__ = (
        Index("ix_exports_type_status", "export_type", "status"),
        Index("ix_exports_requested_created", "requested_by_id", "created_at"),
    )

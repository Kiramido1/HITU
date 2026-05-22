"""
LMS models — Materials, Assignments, Submissions, Notifications.
"""
import uuid
import enum
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import (
    BigInteger, Boolean, CheckConstraint, DateTime, Enum as SAEnum,
    Float, ForeignKey, Index, Integer, String, Text, func
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.academic import Course


class MaterialType(str, enum.Enum):
    lecture = "lecture"
    lab = "lab"
    assignment = "assignment"
    reference = "reference"
    video = "video"
    other = "other"


class NotificationType(str, enum.Enum):
    info = "info"
    success = "success"
    warning = "warning"
    error = "error"
    assignment = "assignment"
    grade = "grade"
    announcement = "announcement"


# ── Material ────────────────────────────────────────────────────────────────────

class Material(Base, TimestampMixin):
    __tablename__ = "materials"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    uploader_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    material_type: Mapped[MaterialType] = mapped_column(
        SAEnum(MaterialType, name="material_type"),
        default=MaterialType.lecture,
        nullable=False,
    )
    file_url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    file_size: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)  # bytes
    file_name: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    mime_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    week_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    download_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    course: Mapped["Course"] = relationship("Course", back_populates="materials")
    uploader: Mapped[Optional["User"]] = relationship("User", foreign_keys=[uploader_id])

    __table_args__ = (
        CheckConstraint("file_size IS NULL OR file_size >= 0", name="ck_materials_file_size"),
        CheckConstraint("week_number IS NULL OR week_number BETWEEN 1 AND 52", name="ck_materials_week"),
        Index("ix_materials_course_week", "course_id", "week_number"),
        Index("ix_materials_published_type", "is_published", "material_type"),
    )


# ── Assignment ──────────────────────────────────────────────────────────────────

class Assignment(Base, TimestampMixin):
    __tablename__ = "assignments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    creator_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    instructions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    deadline: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    max_grade: Mapped[float] = mapped_column(Float, default=100.0, nullable=False)
    allow_late: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    late_penalty_pct: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    course: Mapped["Course"] = relationship("Course", back_populates="assignments")
    creator: Mapped[Optional["User"]] = relationship("User", foreign_keys=[creator_id])
    submissions: Mapped[list["Submission"]] = relationship("Submission", back_populates="assignment", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("max_grade >= 0", name="ck_assignments_max_grade"),
        CheckConstraint("late_penalty_pct >= 0 AND late_penalty_pct <= 100", name="ck_assignments_late_penalty"),
        Index("ix_assignments_course_deadline", "course_id", "deadline"),
        Index("ix_assignments_published_deadline", "is_published", "deadline"),
    )


# ── Submission ──────────────────────────────────────────────────────────────────

class Submission(Base, TimestampMixin):
    __tablename__ = "submissions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assignment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("assignments.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    grader_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    file_url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    file_name: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    text_answer: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    is_late: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    grade: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    graded_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    assignment: Mapped["Assignment"] = relationship("Assignment", back_populates="submissions")
    student: Mapped["User"] = relationship("User", back_populates="submissions", foreign_keys=[student_id])
    grader: Mapped[Optional["User"]] = relationship("User", back_populates="graded_submissions", foreign_keys=[grader_id])

    __table_args__ = (
        CheckConstraint("grade IS NULL OR grade >= 0", name="ck_submissions_grade"),
        Index("ix_submissions_assignment_student", "assignment_id", "student_id", unique=True),
        Index("ix_submissions_student_submitted", "student_id", "submitted_at"),
    )


# ── Notification ────────────────────────────────────────────────────────────────

class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    body: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    notification_type: Mapped[NotificationType] = mapped_column(
        SAEnum(NotificationType, name="notification_type"),
        default=NotificationType.info,
        nullable=False,
    )
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    link: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationship
    user: Mapped["User"] = relationship("User", back_populates="notifications")

    __table_args__ = (
        Index("ix_notifications_user_unread", "user_id", "is_read"),
        Index("ix_notifications_created", "created_at"),
    )

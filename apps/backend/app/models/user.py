"""User, role, and permission models for RBAC."""
import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Index,
    String,
    Table,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.academic import (
        AssistantAvailability,
        CourseAssignment,
        DoctorAvailability,
        ScheduleSlot,
        Student,
    )
    from app.models.lms import Notification, Submission
    from app.models.platform import AuditLog, Export


class UserRole(str, enum.Enum):
    admin = "admin"
    doctor = "doctor"
    assistant = "assistant"
    student = "student"


role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column("role_id", UUID(as_uuid=True), ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column(
        "permission_id",
        UUID(as_uuid=True),
        ForeignKey("permissions.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("role_id", UUID(as_uuid=True), ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
)


class Role(Base, TimestampMixin):
    __tablename__ = "roles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(80), nullable=False, unique=True)
    display_name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_system: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    permissions: Mapped[List["Permission"]] = relationship(
        "Permission",
        secondary=role_permissions,
        back_populates="roles",
        lazy="selectin",
    )
    users: Mapped[List["User"]] = relationship(
        "User",
        secondary=user_roles,
        back_populates="roles",
        lazy="selectin",
    )

    __table_args__ = (Index("ix_roles_name_active", "name", "is_active"),)


class Permission(Base, TimestampMixin):
    __tablename__ = "permissions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resource: Mapped[str] = mapped_column(String(80), nullable=False)
    action: Mapped[str] = mapped_column(String(80), nullable=False)
    name: Mapped[str] = mapped_column(String(160), nullable=False, unique=True)
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    roles: Mapped[List[Role]] = relationship(
        "Role",
        secondary=role_permissions,
        back_populates="permissions",
        lazy="selectin",
    )

    __table_args__ = (
        UniqueConstraint("resource", "action", name="uq_permissions_resource_action"),
        Index("ix_permissions_resource_action", "resource", "action"),
    )


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    arabic_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    role: Mapped[UserRole] = mapped_column(
        SAEnum(UserRole, name="user_role"),
        nullable=False,
        default=UserRole.student,
        index=True,
    )
    primary_role_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("roles.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    department_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("departments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    department: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    student_id: Mapped[Optional[str]] = mapped_column(String(50), unique=True, nullable=True)
    faculty_id: Mapped[Optional[str]] = mapped_column(String(50), unique=True, nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    primary_role: Mapped[Optional[Role]] = relationship("Role", foreign_keys=[primary_role_id])
    roles: Mapped[List[Role]] = relationship(
        "Role",
        secondary=user_roles,
        back_populates="users",
        lazy="selectin",
    )
    department_ref = relationship("Department", foreign_keys=[department_id])
    student_profile: Mapped[Optional["Student"]] = relationship(
        "Student",
        back_populates="user",
        cascade="all, delete-orphan",
        uselist=False,
    )
    course_assignments: Mapped[List["CourseAssignment"]] = relationship(
        "CourseAssignment",
        back_populates="staff",
        foreign_keys="CourseAssignment.staff_id",
        cascade="all, delete-orphan",
    )
    doctor_availability: Mapped[List["DoctorAvailability"]] = relationship(
        "DoctorAvailability",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    assistant_availability: Mapped[List["AssistantAvailability"]] = relationship(
        "AssistantAvailability",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    notifications: Mapped[List["Notification"]] = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    submissions: Mapped[List["Submission"]] = relationship(
        "Submission",
        back_populates="student",
        foreign_keys="Submission.student_id",
    )
    graded_submissions: Mapped[List["Submission"]] = relationship(
        "Submission",
        back_populates="grader",
        foreign_keys="Submission.grader_id",
    )
    generated_schedule_slots: Mapped[List["ScheduleSlot"]] = relationship(
        "ScheduleSlot",
        foreign_keys="ScheduleSlot.generated_by_id",
    )
    audit_logs: Mapped[List["AuditLog"]] = relationship(
        "AuditLog",
        back_populates="actor",
        foreign_keys="AuditLog.actor_id",
    )
    exports: Mapped[List["Export"]] = relationship(
        "Export",
        back_populates="requested_by",
        foreign_keys="Export.requested_by_id",
    )

    __table_args__ = (
        Index("ix_users_email_role", "email", "role"),
        Index("ix_users_department_role", "department_id", "role"),
    )

    def __repr__(self) -> str:
        return f"<User {self.email} [{self.role.value}]>"

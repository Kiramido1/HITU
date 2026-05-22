"""LMS Pydantic schemas — Material, Assignment, Submission, Notification."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.lms import MaterialType, NotificationType
from app.schemas.user import UserListResponse


# ── Material ─────────────────────────────────────────────────────────────────

class MaterialCreate(BaseModel):
    course_id: UUID
    title: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = None
    material_type: MaterialType = MaterialType.lecture
    week_number: Optional[int] = Field(None, ge=1, le=52)
    is_published: bool = True


class MaterialUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    material_type: Optional[MaterialType] = None
    week_number: Optional[int] = None
    is_published: Optional[bool] = None


class MaterialResponse(BaseModel):
    id: UUID
    course_id: UUID
    uploader_id: Optional[UUID] = None
    title: str
    description: Optional[str] = None
    material_type: MaterialType
    file_url: Optional[str] = None
    file_size: Optional[int] = None
    file_name: Optional[str] = None
    mime_type: Optional[str] = None
    week_number: Optional[int] = None
    is_published: bool
    download_count: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ── Assignment ───────────────────────────────────────────────────────────────

class AssignmentCreate(BaseModel):
    course_id: UUID
    title: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = None
    instructions: Optional[str] = None
    deadline: Optional[datetime] = None
    max_grade: float = Field(100.0, ge=0)
    allow_late: bool = False
    late_penalty_pct: float = Field(0.0, ge=0, le=100)
    is_published: bool = False


class AssignmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    instructions: Optional[str] = None
    deadline: Optional[datetime] = None
    max_grade: Optional[float] = None
    allow_late: Optional[bool] = None
    late_penalty_pct: Optional[float] = None
    is_published: Optional[bool] = None


class AssignmentResponse(BaseModel):
    id: UUID
    course_id: UUID
    creator_id: Optional[UUID] = None
    title: str
    description: Optional[str] = None
    instructions: Optional[str] = None
    deadline: Optional[datetime] = None
    max_grade: float
    allow_late: bool
    late_penalty_pct: float
    is_published: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ── Submission ───────────────────────────────────────────────────────────────

class SubmissionCreate(BaseModel):
    assignment_id: UUID
    text_answer: Optional[str] = None


class GradeSubmission(BaseModel):
    grade: float = Field(..., ge=0)
    feedback: Optional[str] = None


class SubmissionResponse(BaseModel):
    id: UUID
    assignment_id: UUID
    student_id: UUID
    grader_id: Optional[UUID] = None
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    text_answer: Optional[str] = None
    submitted_at: datetime
    is_late: bool
    grade: Optional[float] = None
    feedback: Optional[str] = None
    graded_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class SubmissionDetailResponse(SubmissionResponse):
    student: Optional[UserListResponse] = None
    grader: Optional[UserListResponse] = None
    model_config = ConfigDict(from_attributes=True)


# ── Notification ─────────────────────────────────────────────────────────────

class NotificationCreate(BaseModel):
    user_id: UUID
    title: str = Field(..., max_length=200)
    body: Optional[str] = None
    notification_type: NotificationType = NotificationType.info
    link: Optional[str] = None


class NotificationResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    body: Optional[str] = None
    notification_type: NotificationType
    is_read: bool
    link: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

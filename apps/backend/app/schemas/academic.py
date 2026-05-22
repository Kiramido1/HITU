"""Academic Pydantic schemas — Semester, Department, Course, Hall, Availability, Schedule."""
from datetime import date, datetime, time
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.academic import (
    CourseLevel, DayOfWeek, HallType, ScheduleEntryType, SemesterStatus
)
from app.schemas.user import UserListResponse


# ── Semester ─────────────────────────────────────────────────────────────────

class SemesterCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    academic_year: str = Field(..., pattern=r"^\d{4}/\d{4}$")
    semester_number: int = Field(..., ge=1, le=2)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: Optional[str] = None


class SemesterUpdate(BaseModel):
    name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[SemesterStatus] = None
    description: Optional[str] = None


class SemesterResponse(BaseModel):
    id: UUID
    name: str
    academic_year: str
    semester_number: int
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: SemesterStatus
    is_active: bool
    description: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ── Department ───────────────────────────────────────────────────────────────

class DepartmentCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    code: str = Field(..., min_length=2, max_length=20)
    description: Optional[str] = None
    student_count: int = Field(0, ge=0)
    head_of_department: Optional[str] = None
    semester_id: Optional[UUID] = None


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    student_count: Optional[int] = None
    head_of_department: Optional[str] = None


class DepartmentResponse(BaseModel):
    id: UUID
    name: str
    code: str
    description: Optional[str] = None
    student_count: int
    head_of_department: Optional[str] = None
    semester_id: Optional[UUID] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ── Course ───────────────────────────────────────────────────────────────────

class CourseCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    code: str = Field(..., min_length=2, max_length=30)
    description: Optional[str] = None
    credit_hours: int = Field(3, ge=1, le=10)
    lecture_count: int = Field(2, ge=0, le=10)
    section_count: int = Field(2, ge=0, le=20)
    lab_count: int = Field(0, ge=0, le=10)
    student_count: int = Field(0, ge=0)
    level: Optional[CourseLevel] = None
    department_id: Optional[UUID] = None
    semester_id: Optional[UUID] = None
    doctor_id: Optional[UUID] = None


class CourseUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    credit_hours: Optional[int] = None
    lecture_count: Optional[int] = None
    section_count: Optional[int] = None
    lab_count: Optional[int] = None
    student_count: Optional[int] = None
    level: Optional[CourseLevel] = None
    doctor_id: Optional[UUID] = None
    is_active: Optional[bool] = None


class CourseResponse(BaseModel):
    id: UUID
    name: str
    code: str
    description: Optional[str] = None
    credit_hours: int
    lecture_count: int
    section_count: int
    lab_count: int
    student_count: int
    level: Optional[CourseLevel] = None
    department_id: Optional[UUID] = None
    semester_id: Optional[UUID] = None
    doctor_id: Optional[UUID] = None
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class CourseDetailResponse(CourseResponse):
    doctor: Optional[UserListResponse] = None
    model_config = ConfigDict(from_attributes=True)


# ── Hall ─────────────────────────────────────────────────────────────────────

class HallCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    code: str = Field(..., min_length=2, max_length=20)
    capacity: int = Field(..., ge=1, le=2000)
    hall_type: HallType = HallType.lecture
    floor: Optional[int] = None
    building: Optional[str] = None
    has_projector: bool = True
    has_ac: bool = True
    has_computers: bool = False
    notes: Optional[str] = None


class HallUpdate(BaseModel):
    name: Optional[str] = None
    capacity: Optional[int] = None
    hall_type: Optional[HallType] = None
    floor: Optional[int] = None
    building: Optional[str] = None
    has_projector: Optional[bool] = None
    has_ac: Optional[bool] = None
    has_computers: Optional[bool] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None


class HallResponse(BaseModel):
    id: UUID
    name: str
    code: str
    capacity: int
    hall_type: HallType
    floor: Optional[int] = None
    building: Optional[str] = None
    has_projector: bool
    has_ac: bool
    has_computers: bool
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ── Availability ─────────────────────────────────────────────────────────────

class AvailabilitySlot(BaseModel):
    day: DayOfWeek
    start_time: time
    end_time: time
    is_blocked: bool = False
    is_preferred: bool = False
    note: Optional[str] = None


class AvailabilityBulkSet(BaseModel):
    """Replace all availability slots for a user."""
    slots: List[AvailabilitySlot]


class AvailabilityResponse(BaseModel):
    id: UUID
    user_id: UUID
    day: DayOfWeek
    start_time: time
    end_time: time
    is_blocked: bool
    is_preferred: bool
    note: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


# ── Schedule ─────────────────────────────────────────────────────────────────

class ScheduleEntryCreate(BaseModel):
    semester_id: UUID
    course_id: UUID
    hall_id: Optional[UUID] = None
    doctor_id: Optional[UUID] = None
    assistant_id: Optional[UUID] = None
    entry_type: ScheduleEntryType = ScheduleEntryType.lecture
    day_of_week: DayOfWeek
    start_time: time
    end_time: time
    group_number: Optional[int] = None
    notes: Optional[str] = None


class ScheduleEntryUpdate(BaseModel):
    hall_id: Optional[UUID] = None
    doctor_id: Optional[UUID] = None
    assistant_id: Optional[UUID] = None
    day_of_week: Optional[DayOfWeek] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    notes: Optional[str] = None


class ScheduleEntryResponse(BaseModel):
    id: UUID
    semester_id: UUID
    course_id: UUID
    hall_id: Optional[UUID] = None
    doctor_id: Optional[UUID] = None
    assistant_id: Optional[UUID] = None
    entry_type: ScheduleEntryType
    day_of_week: DayOfWeek
    start_time: time
    end_time: time
    group_number: Optional[int] = None
    conflict_flag: bool
    ai_generated: bool
    notes: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ScheduleEntryDetailResponse(ScheduleEntryResponse):
    course: Optional[CourseResponse] = None
    hall: Optional[HallResponse] = None
    doctor: Optional[UserListResponse] = None
    assistant: Optional[UserListResponse] = None
    model_config = ConfigDict(from_attributes=True)

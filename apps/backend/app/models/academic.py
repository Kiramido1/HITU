"""Academic, enrollment, availability, and scheduling models."""
import enum
import uuid
from datetime import date, datetime, time
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    Enum as SAEnum,
    Float,
    ForeignKey,
    Index,
    Integer,
    SmallInteger,
    String,
    Text,
    Time,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship, synonym

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.lms import Assignment, Material
    from app.models.user import User


class SemesterStatus(str, enum.Enum):
    upcoming = "upcoming"
    active = "active"
    completed = "completed"
    archived = "archived"


class HallType(str, enum.Enum):
    lecture = "lecture"
    lab = "lab"
    seminar = "seminar"
    amphitheater = "amphitheater"
    online = "online"


class DayOfWeek(str, enum.Enum):
    saturday = "saturday"
    sunday = "sunday"
    monday = "monday"
    tuesday = "tuesday"
    wednesday = "wednesday"
    thursday = "thursday"


class ScheduleSlotType(str, enum.Enum):
    lecture = "lecture"
    section = "section"
    lab = "lab"
    exam = "exam"


ScheduleEntryType = ScheduleSlotType


class CourseLevel(str, enum.Enum):
    level_1 = "1"
    level_2 = "2"
    level_3 = "3"
    level_4 = "4"
    postgrad = "pg"


class CourseAssignmentType(str, enum.Enum):
    doctor = "doctor"
    assistant = "assistant"
    coordinator = "coordinator"


class ScheduleStatus(str, enum.Enum):
    draft = "draft"
    generated = "generated"
    approved = "approved"
    published = "published"
    archived = "archived"


class StudentCourseStatus(str, enum.Enum):
    enrolled = "enrolled"
    completed = "completed"
    dropped = "dropped"
    withdrawn = "withdrawn"


class Semester(Base, TimestampMixin):
    __tablename__ = "semesters"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    academic_year: Mapped[str] = mapped_column(String(20), nullable=False)
    year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    semester_number: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    status: Mapped[SemesterStatus] = mapped_column(
        SAEnum(SemesterStatus, name="semester_status"),
        default=SemesterStatus.upcoming,
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    departments: Mapped[List["Department"]] = relationship(
        "Department",
        back_populates="semester",
        cascade="all, delete-orphan",
    )
    academic_levels: Mapped[List["AcademicLevel"]] = relationship(
        "AcademicLevel",
        back_populates="semester",
        cascade="all, delete-orphan",
    )
    courses: Mapped[List["Course"]] = relationship(
        "Course",
        back_populates="semester",
        cascade="all, delete-orphan",
    )
    schedules: Mapped[List["Schedule"]] = relationship(
        "Schedule",
        back_populates="semester",
        cascade="all, delete-orphan",
    )
    schedule_entries: Mapped[List["ScheduleSlot"]] = relationship(
        "ScheduleSlot",
        back_populates="semester",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        UniqueConstraint("academic_year", "semester_number", name="uq_semester_year_number"),
        CheckConstraint("semester_number IN (1, 2, 3)", name="ck_semesters_number"),
        CheckConstraint("end_date IS NULL OR start_date IS NULL OR end_date > start_date", name="ck_semesters_dates"),
        Index("ix_semesters_active_status", "is_active", "status"),
    )


class Department(Base, TimestampMixin):
    __tablename__ = "departments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    semester_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("semesters.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    code: Mapped[str] = mapped_column(String(20), nullable=False, unique=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    student_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    head_of_department: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    semester: Mapped[Optional[Semester]] = relationship("Semester", back_populates="departments")
    academic_levels: Mapped[List["AcademicLevel"]] = relationship(
        "AcademicLevel",
        back_populates="department",
        cascade="all, delete-orphan",
    )
    courses: Mapped[List["Course"]] = relationship("Course", back_populates="department")
    students: Mapped[List["Student"]] = relationship("Student", back_populates="department")

    __table_args__ = (
        CheckConstraint("student_count >= 0", name="ck_departments_student_count"),
        Index("ix_departments_code_active", "code", "is_active"),
    )


class AcademicLevel(Base, TimestampMixin):
    __tablename__ = "academic_levels"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    department_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("departments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    semester_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("semesters.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    code: Mapped[str] = mapped_column(String(20), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    year_number: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    expected_students: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    department: Mapped[Department] = relationship("Department", back_populates="academic_levels")
    semester: Mapped[Optional[Semester]] = relationship("Semester", back_populates="academic_levels")
    courses: Mapped[List["Course"]] = relationship("Course", back_populates="academic_level")
    students: Mapped[List["Student"]] = relationship("Student", back_populates="academic_level")

    __table_args__ = (
        UniqueConstraint("department_id", "code", name="uq_academic_levels_department_code"),
        CheckConstraint("year_number BETWEEN 1 AND 8", name="ck_academic_levels_year"),
        CheckConstraint("expected_students >= 0", name="ck_academic_levels_expected_students"),
    )


class CourseAssignment(Base, TimestampMixin):
    __tablename__ = "course_assignments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    staff_id: Mapped[uuid.UUID] = mapped_column(
        "user_id",
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    assignment_type: Mapped[CourseAssignmentType] = mapped_column(
        SAEnum(CourseAssignmentType, name="course_assignment_type"),
        default=CourseAssignmentType.assistant,
        nullable=False,
    )
    section_group: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    workload_hours: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    assistant_id = synonym("staff_id")

    course: Mapped["Course"] = relationship("Course", back_populates="course_assistants")
    staff: Mapped["User"] = relationship("User", back_populates="course_assignments", foreign_keys=[staff_id])
    assistant: Mapped["User"] = relationship("User", foreign_keys=[staff_id], viewonly=True)

    __table_args__ = (
        UniqueConstraint("course_id", "user_id", "assignment_type", "section_group", name="uq_course_assignments_scope"),
        CheckConstraint("workload_hours >= 0", name="ck_course_assignments_workload"),
        Index("ix_course_assignments_staff_type", "user_id", "assignment_type"),
    )


CourseAssistant = CourseAssignment


class Course(Base, TimestampMixin):
    __tablename__ = "courses"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    department_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("departments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    semester_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("semesters.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    academic_level_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("academic_levels.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    doctor_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[str] = mapped_column(String(30), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    credit_hours: Mapped[int] = mapped_column(SmallInteger, default=3, nullable=False)
    credits = synonym("credit_hours")
    lecture_count: Mapped[int] = mapped_column(SmallInteger, default=2, nullable=False)
    section_count: Mapped[int] = mapped_column(SmallInteger, default=2, nullable=False)
    lab_count: Mapped[int] = mapped_column(SmallInteger, default=0, nullable=False)
    student_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    level: Mapped[Optional[CourseLevel]] = mapped_column(SAEnum(CourseLevel, name="course_level"), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    department: Mapped[Optional[Department]] = relationship("Department", back_populates="courses")
    semester: Mapped[Optional[Semester]] = relationship("Semester", back_populates="courses")
    academic_level: Mapped[Optional[AcademicLevel]] = relationship("AcademicLevel", back_populates="courses")
    doctor: Mapped[Optional["User"]] = relationship("User", foreign_keys=[doctor_id])
    course_assistants: Mapped[List[CourseAssignment]] = relationship(
        "CourseAssignment",
        back_populates="course",
        cascade="all, delete-orphan",
    )
    student_courses: Mapped[List["StudentCourse"]] = relationship(
        "StudentCourse",
        back_populates="course",
        cascade="all, delete-orphan",
    )
    materials: Mapped[List["Material"]] = relationship(
        "Material",
        back_populates="course",
        cascade="all, delete-orphan",
    )
    assignments: Mapped[List["Assignment"]] = relationship(
        "Assignment",
        back_populates="course",
        cascade="all, delete-orphan",
    )
    schedule_entries: Mapped[List["ScheduleSlot"]] = relationship("ScheduleSlot", back_populates="course")

    __table_args__ = (
        UniqueConstraint("code", "semester_id", name="uq_course_code_semester"),
        CheckConstraint("credit_hours > 0", name="ck_courses_credit_hours"),
        CheckConstraint("lecture_count >= 0 AND section_count >= 0 AND lab_count >= 0", name="ck_courses_session_counts"),
        CheckConstraint("student_count >= 0", name="ck_courses_student_count"),
        Index("ix_courses_semester_level", "semester_id", "level"),
        Index("ix_courses_department_active", "department_id", "is_active"),
    )


class Hall(Base, TimestampMixin):
    __tablename__ = "halls"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(20), nullable=False, unique=True)
    capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    hall_type: Mapped[HallType] = mapped_column(
        SAEnum(HallType, name="hall_type"),
        default=HallType.lecture,
        nullable=False,
    )
    floor: Mapped[Optional[int]] = mapped_column(SmallInteger, nullable=True)
    building: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    has_projector: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    has_ac: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    has_computers: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    availability: Mapped[List["HallAvailability"]] = relationship(
        "HallAvailability",
        back_populates="hall",
        cascade="all, delete-orphan",
    )
    schedule_entries: Mapped[List["ScheduleSlot"]] = relationship("ScheduleSlot", back_populates="hall")

    __table_args__ = (
        CheckConstraint("capacity > 0", name="ck_halls_capacity"),
        Index("ix_halls_type_capacity", "hall_type", "capacity"),
    )


class HallAvailability(Base, TimestampMixin):
    __tablename__ = "hall_availability"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hall_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("halls.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    day: Mapped[DayOfWeek] = mapped_column(SAEnum(DayOfWeek, name="day_of_week"), nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    is_blocked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    reason: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)

    hall: Mapped[Hall] = relationship("Hall", back_populates="availability")

    __table_args__ = (
        CheckConstraint("end_time > start_time", name="ck_hall_availability_time"),
        Index("ix_hall_availability_hall_day", "hall_id", "day"),
    )


class DoctorAvailability(Base, TimestampMixin):
    __tablename__ = "doctor_availability"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    day: Mapped[DayOfWeek] = mapped_column(SAEnum(DayOfWeek, name="day_of_week"), nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    is_blocked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_preferred: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    note: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="doctor_availability")

    __table_args__ = (
        CheckConstraint("end_time > start_time", name="ck_doctor_availability_time"),
        Index("ix_doctor_avail_user_day", "user_id", "day"),
    )


class AssistantAvailability(Base, TimestampMixin):
    __tablename__ = "assistant_availability"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    day: Mapped[DayOfWeek] = mapped_column(SAEnum(DayOfWeek, name="day_of_week"), nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    is_blocked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_preferred: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    note: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="assistant_availability")

    __table_args__ = (
        CheckConstraint("end_time > start_time", name="ck_assistant_availability_time"),
        Index("ix_asst_avail_user_day", "user_id", "day"),
    )


class Student(Base, TimestampMixin):
    __tablename__ = "students"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    department_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("departments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    academic_level_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("academic_levels.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    university_id: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    enrollment_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    gpa: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="student_profile")
    department: Mapped[Optional[Department]] = relationship("Department", back_populates="students")
    academic_level: Mapped[Optional[AcademicLevel]] = relationship("AcademicLevel", back_populates="students")
    student_courses: Mapped[List["StudentCourse"]] = relationship(
        "StudentCourse",
        back_populates="student",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        CheckConstraint("gpa IS NULL OR (gpa >= 0 AND gpa <= 4)", name="ck_students_gpa"),
        Index("ix_students_department_level", "department_id", "academic_level_id"),
    )


class StudentCourse(Base, TimestampMixin):
    __tablename__ = "student_courses"

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("students.id", ondelete="CASCADE"),
        primary_key=True,
    )
    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("courses.id", ondelete="CASCADE"),
        primary_key=True,
    )
    status: Mapped[StudentCourseStatus] = mapped_column(
        SAEnum(StudentCourseStatus, name="student_course_status"),
        default=StudentCourseStatus.enrolled,
        nullable=False,
    )
    enrolled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    final_grade: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    student: Mapped[Student] = relationship("Student", back_populates="student_courses")
    course: Mapped[Course] = relationship("Course", back_populates="student_courses")

    __table_args__ = (
        CheckConstraint("final_grade IS NULL OR (final_grade >= 0 AND final_grade <= 100)", name="ck_student_courses_grade"),
        Index("ix_student_courses_course_status", "course_id", "status"),
    )


class Schedule(Base, TimestampMixin):
    __tablename__ = "schedules"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    semester_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("semesters.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    status: Mapped[ScheduleStatus] = mapped_column(
        SAEnum(ScheduleStatus, name="schedule_status"),
        default=ScheduleStatus.draft,
        nullable=False,
    )
    generated_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    published_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    generated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    optimization_strategy: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    optimization_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    constraints_snapshot: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    semester: Mapped[Semester] = relationship("Semester", back_populates="schedules")
    generated_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[generated_by_id])
    published_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[published_by_id])
    slots: Mapped[List["ScheduleSlot"]] = relationship(
        "ScheduleSlot",
        back_populates="schedule",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        UniqueConstraint("semester_id", "name", name="uq_schedules_semester_name"),
        Index("ix_schedules_semester_status", "semester_id", "status"),
    )


class ScheduleSlot(Base, TimestampMixin):
    __tablename__ = "schedule_slots"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    schedule_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("schedules.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    semester_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("semesters.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    hall_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("halls.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    doctor_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    assistant_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    generated_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    entry_type: Mapped[ScheduleSlotType] = mapped_column(
        "slot_type",
        SAEnum(ScheduleSlotType, name="schedule_slot_type"),
        default=ScheduleSlotType.lecture,
        nullable=False,
    )
    day_of_week: Mapped[DayOfWeek] = mapped_column(SAEnum(DayOfWeek, name="day_of_week"), nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    group_number: Mapped[Optional[int]] = mapped_column(SmallInteger, nullable=True)
    conflict_flag: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    ai_generated: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    locked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)

    schedule: Mapped[Optional[Schedule]] = relationship("Schedule", back_populates="slots")
    semester: Mapped[Semester] = relationship("Semester", back_populates="schedule_entries")
    course: Mapped[Course] = relationship("Course", back_populates="schedule_entries")
    hall: Mapped[Optional[Hall]] = relationship("Hall", back_populates="schedule_entries")
    doctor: Mapped[Optional["User"]] = relationship("User", foreign_keys=[doctor_id])
    assistant: Mapped[Optional["User"]] = relationship("User", foreign_keys=[assistant_id])
    generated_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[generated_by_id])

    __table_args__ = (
        CheckConstraint("end_time > start_time", name="ck_schedule_slots_time"),
        Index("ix_schedule_semester_day", "semester_id", "day_of_week"),
        Index("ix_schedule_hall_day_time", "hall_id", "day_of_week", "start_time"),
        Index("ix_schedule_doctor_day_time", "doctor_id", "day_of_week", "start_time"),
        Index("ix_schedule_assistant_day_time", "assistant_id", "day_of_week", "start_time"),
    )


ScheduleEntry = ScheduleSlot

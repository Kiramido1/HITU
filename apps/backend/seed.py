"""Seed HITU with non-sensitive reference data and optional demo accounts."""
from __future__ import annotations

from datetime import date, time
import logging
import os
import secrets

import bcrypt
from sqlalchemy.orm import Session

from app.database.session import Base, SessionLocal, sync_engine
from app.models.academic import (
    AcademicLevel,
    AssistantAvailability,
    Course,
    CourseAssignment,
    CourseAssignmentType,
    CourseLevel,
    DayOfWeek,
    Department,
    DoctorAvailability,
    Hall,
    HallAvailability,
    HallType,
    Schedule,
    ScheduleSlot,
    ScheduleSlotType,
    ScheduleStatus,
    Semester,
    SemesterStatus,
    Student,
    StudentCourse,
)
from app.models.lms import Assignment, Material, MaterialType, Notification, NotificationType
from app.models.platform import Analytics, AnalyticsScope
from app.models.user import Permission, Role, User, UserRole

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)


ROLE_PERMISSIONS = {
    "admin": ["users:*", "academic:*", "schedule:*", "lms:*", "analytics:*", "exports:*", "audit:read"],
    "doctor": ["academic:read", "schedule:read", "lms:*", "analytics:read"],
    "assistant": ["academic:read", "schedule:read", "lms:read", "lms:update"],
    "student": ["academic:read", "schedule:read", "lms:read", "submissions:create"],
}


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def seed_password(env_name: str) -> str:
    value = os.getenv(env_name)
    if value:
        return value
    logger.warning("%s is not set; generated an ephemeral password for this seed run.", env_name)
    return secrets.token_urlsafe(24)


def get_or_create_role(db: Session, name: str, display_name: str) -> Role:
    role = db.query(Role).filter(Role.name == name).one_or_none()
    if role:
        return role
    role = Role(name=name, display_name=display_name, is_system=True, is_active=True)
    db.add(role)
    db.flush()
    return role


def seed_rbac(db: Session) -> dict[str, Role]:
    permission_cache: dict[str, Permission] = {}
    roles = {
        "admin": get_or_create_role(db, "admin", "Administrator"),
        "doctor": get_or_create_role(db, "doctor", "Doctor"),
        "assistant": get_or_create_role(db, "assistant", "Teaching Assistant"),
        "student": get_or_create_role(db, "student", "Student"),
    }

    for permission_name in sorted({p for permissions in ROLE_PERMISSIONS.values() for p in permissions}):
        resource, action = permission_name.split(":", 1)
        permission = db.query(Permission).filter(Permission.name == permission_name).one_or_none()
        if not permission:
            permission = Permission(
                name=permission_name,
                resource=resource,
                action=action,
                description=f"Allow {action} on {resource}",
            )
            db.add(permission)
            db.flush()
        permission_cache[permission_name] = permission

    for role_name, permission_names in ROLE_PERMISSIONS.items():
        role = roles[role_name]
        role.permissions = [permission_cache[name] for name in permission_names]

    logger.info("Seeded RBAC roles and permissions")
    return roles


def get_or_create_user(
    db: Session,
    *,
    email: str,
    full_name: str,
    role: UserRole,
    password_env: str,
    department: str | None = None,
    student_id: str | None = None,
    faculty_id: str | None = None,
    role_record: Role,
) -> User:
    user = db.query(User).filter(User.email == email).one_or_none()
    if user:
        return user

    user = User(
        email=email,
        full_name=full_name,
        role=role,
        primary_role_id=role_record.id,
        hashed_password=hash_password(seed_password(password_env)),
        is_active=True,
        is_verified=True,
        department=department,
        student_id=student_id,
        faculty_id=faculty_id,
    )
    user.roles.append(role_record)
    db.add(user)
    db.flush()
    return user


def seed_database() -> None:
    logger.info("Creating database tables if needed")
    Base.metadata.create_all(bind=sync_engine)

    db: Session = SessionLocal()
    try:
        roles = seed_rbac(db)

        semester = db.query(Semester).filter(
            Semester.academic_year == "2025/2026",
            Semester.semester_number == 1,
        ).one_or_none()
        if not semester:
            semester = Semester(
                name="Fall 2025",
                academic_year="2025/2026",
                year=2025,
                semester_number=1,
                start_date=date(2025, 9, 15),
                end_date=date(2026, 1, 15),
                status=SemesterStatus.active,
                is_active=True,
            )
            db.add(semester)
            db.flush()

        departments = {}
        for code, name in (
            ("CS", "Computer Science"),
            ("SE", "Software Engineering"),
            ("AI", "Artificial Intelligence"),
            ("NET", "Computer Networks"),
        ):
            department = db.query(Department).filter(Department.code == code).one_or_none()
            if not department:
                department = Department(code=code, name=name, semester_id=semester.id, description=f"{name} department")
                db.add(department)
                db.flush()
            departments[code] = department

        levels = {}
        for code, year_number in (("L1", 1), ("L2", 2), ("L3", 3), ("L4", 4)):
            level = db.query(AcademicLevel).filter(
                AcademicLevel.department_id == departments["CS"].id,
                AcademicLevel.code == code,
            ).one_or_none()
            if not level:
                level = AcademicLevel(
                    department_id=departments["CS"].id,
                    semester_id=semester.id,
                    code=code,
                    name=f"Computer Science Level {year_number}",
                    year_number=year_number,
                    expected_students=120,
                )
                db.add(level)
                db.flush()
            levels[code] = level

        halls = []
        for hall_data in (
            ("A-101", "Alan Turing Hall", 150, HallType.lecture),
            ("B-201", "Grace Hopper Hall", 120, HallType.lecture),
            ("L-101", "Ada Lovelace Lab", 40, HallType.lab),
            ("L-102", "John von Neumann Lab", 40, HallType.lab),
            ("S-101", "Seminar Room 1", 30, HallType.seminar),
        ):
            code, name, capacity, hall_type = hall_data
            hall = db.query(Hall).filter(Hall.code == code).one_or_none()
            if not hall:
                hall = Hall(code=code, name=name, capacity=capacity, hall_type=hall_type, building="Main Campus")
                db.add(hall)
                db.flush()
            halls.append(hall)

        for hall in halls:
            for day in DayOfWeek:
                exists = db.query(HallAvailability).filter(
                    HallAvailability.hall_id == hall.id,
                    HallAvailability.day == day,
                    HallAvailability.start_time == time(8, 0),
                ).one_or_none()
                if not exists:
                    db.add(
                        HallAvailability(
                            hall_id=hall.id,
                            day=day,
                            start_time=time(8, 0),
                            end_time=time(18, 30),
                            is_blocked=False,
                        )
                    )

        doctor = get_or_create_user(
            db,
            email="doctor@hitu.edu",
            full_name="Dr. Ahmed Hassan",
            role=UserRole.doctor,
            role_record=roles["doctor"],
            password_env="SEED_DOCTOR_PASSWORD",
            department="CS",
            faculty_id="FAC-CS-001",
        )
        assistant = get_or_create_user(
            db,
            email="assistant@hitu.edu",
            full_name="Sara Mohamed",
            role=UserRole.assistant,
            role_record=roles["assistant"],
            password_env="SEED_ASSISTANT_PASSWORD",
            department="CS",
            faculty_id="TA-CS-001",
        )
        student_user = get_or_create_user(
            db,
            email="student@hitu.edu",
            full_name="Omar Khalid",
            role=UserRole.student,
            role_record=roles["student"],
            password_env="SEED_STUDENT_PASSWORD",
            department="CS",
            student_id="CS-2024-001",
        )
        get_or_create_user(
            db,
            email="admin@hitu.edu",
            full_name="System Administrator",
            role=UserRole.admin,
            role_record=roles["admin"],
            password_env="SEED_ADMIN_PASSWORD",
        )

        for availability_model, user in ((DoctorAvailability, doctor), (AssistantAvailability, assistant)):
            for day in (DayOfWeek.sunday, DayOfWeek.monday, DayOfWeek.tuesday, DayOfWeek.wednesday):
                exists = db.query(availability_model).filter(
                    availability_model.user_id == user.id,
                    availability_model.day == day,
                    availability_model.start_time == time(8, 0),
                ).one_or_none()
                if not exists:
                    db.add(
                        availability_model(
                            user_id=user.id,
                            day=day,
                            start_time=time(8, 0),
                            end_time=time(16, 30),
                            is_preferred=day in (DayOfWeek.sunday, DayOfWeek.tuesday),
                        )
                    )

        courses = []
        for data in (
            ("CS101", "Introduction to Programming", CourseLevel.level_1, levels["L1"]),
            ("CS201", "Data Structures", CourseLevel.level_2, levels["L2"]),
            ("CS301", "Algorithms", CourseLevel.level_3, levels["L3"]),
            ("CS401", "Operating Systems", CourseLevel.level_4, levels["L4"]),
            ("AI401", "Deep Learning", CourseLevel.level_4, levels["L4"]),
        ):
            code, name, level, academic_level = data
            course = db.query(Course).filter(Course.code == code, Course.semester_id == semester.id).one_or_none()
            if not course:
                course = Course(
                    code=code,
                    name=name,
                    level=level,
                    credit_hours=3,
                    lecture_count=2,
                    section_count=1,
                    student_count=80,
                    department_id=departments["CS"].id,
                    semester_id=semester.id,
                    academic_level_id=academic_level.id,
                    doctor_id=doctor.id,
                )
                db.add(course)
                db.flush()
            courses.append(course)

            assignment = db.query(CourseAssignment).filter(
                CourseAssignment.course_id == course.id,
                CourseAssignment.staff_id == assistant.id,
            ).one_or_none()
            if not assignment:
                db.add(
                    CourseAssignment(
                        course_id=course.id,
                        staff_id=assistant.id,
                        assignment_type=CourseAssignmentType.assistant,
                        workload_hours=4,
                    )
                )

        student = db.query(Student).filter(Student.user_id == student_user.id).one_or_none()
        if not student:
            student = Student(
                user_id=student_user.id,
                department_id=departments["CS"].id,
                academic_level_id=levels["L3"].id,
                university_id="CS-2024-001",
                enrollment_year=2024,
            )
            db.add(student)
            db.flush()

        for course in courses[:3]:
            enrollment = db.query(StudentCourse).filter(
                StudentCourse.student_id == student.id,
                StudentCourse.course_id == course.id,
            ).one_or_none()
            if not enrollment:
                db.add(StudentCourse(student_id=student.id, course_id=course.id))

        schedule = db.query(Schedule).filter(Schedule.semester_id == semester.id, Schedule.name == "Seed Schedule").one_or_none()
        if not schedule:
            schedule = Schedule(
                semester_id=semester.id,
                name="Seed Schedule",
                status=ScheduleStatus.generated,
                generated_by_id=doctor.id,
                optimization_strategy="balanced",
                optimization_score=92.5,
            )
            db.add(schedule)
            db.flush()

        first_slot = db.query(ScheduleSlot).filter(ScheduleSlot.schedule_id == schedule.id).first()
        if not first_slot:
            db.add(
                ScheduleSlot(
                    schedule_id=schedule.id,
                    semester_id=semester.id,
                    course_id=courses[0].id,
                    hall_id=halls[0].id,
                    doctor_id=doctor.id,
                    entry_type=ScheduleSlotType.lecture,
                    day_of_week=DayOfWeek.sunday,
                    start_time=time(8, 0),
                    end_time=time(10, 0),
                    ai_generated=True,
                )
            )

        if not db.query(Material).filter(Material.course_id == courses[0].id).first():
            db.add(
                Material(
                    course_id=courses[0].id,
                    uploader_id=doctor.id,
                    title="Week 1 Lecture Notes",
                    material_type=MaterialType.lecture,
                    week_number=1,
                    is_published=True,
                )
            )

        if not db.query(Assignment).filter(Assignment.course_id == courses[0].id).first():
            db.add(
                Assignment(
                    course_id=courses[0].id,
                    creator_id=doctor.id,
                    title="Programming Fundamentals Assignment",
                    max_grade=100,
                    is_published=True,
                )
            )

        if not db.query(Notification).filter(Notification.user_id == student_user.id).first():
            db.add(
                Notification(
                    user_id=student_user.id,
                    title="Welcome to HITU AI Platform",
                    body="Your academic workspace is ready.",
                    notification_type=NotificationType.info,
                )
            )

        if not db.query(Analytics).filter(Analytics.metric_key == "seeded_courses").first():
            db.add(
                Analytics(
                    scope=AnalyticsScope.platform,
                    metric_key="seeded_courses",
                    metric_value=float(len(courses)),
                    dimensions={"semester": semester.academic_year},
                )
            )

        db.commit()
        logger.info("Seed completed without storing plaintext credentials")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()

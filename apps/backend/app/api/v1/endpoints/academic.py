"""
Academic router — Semesters, Departments, Courses, Halls, Availability.
"""
from typing import List
from uuid import UUID

from fastapi import APIRouter, status, Query

from app.core.dependencies import AdminUser, CurrentUser, DbSession, StaffUser
from app.schemas.academic import (
    CourseCreate, CourseDetailResponse, CourseResponse, CourseUpdate,
    DepartmentCreate, DepartmentResponse, DepartmentUpdate,
    HallCreate, HallResponse, HallUpdate,
    SemesterCreate, SemesterResponse, SemesterUpdate,
    AvailabilityBulkSet, AvailabilityResponse
)
from app.schemas.common import MessageResponse
from app.services.academic_service import AcademicService
from app.repositories.academic import DoctorAvailabilityRepository, AssistantAvailabilityRepository
from app.models.user import UserRole
from app.models.academic import SemesterStatus

router = APIRouter(prefix="/academic", tags=["Academic Core"])

# ── Semesters ────────────────────────────────────────────────────────────────

@router.get("/semesters", response_model=List[SemesterResponse], summary="List all semesters", description="Retrieve a paginated list of all semesters. Can filter by status (active, archived, upcoming).")
async def list_semesters(
    db: DbSession,
    current_user: CurrentUser,
    status_filter: SemesterStatus = None,
    skip: int = Query(0, ge=0, description="Number of records to skip for pagination"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of records to return")
):
    service = AcademicService(db)
    if status_filter:
        return await service.sem_repo.get_by_status(status_filter)
    return await service.sem_repo.get_all(order_by=service.sem_repo.model.created_at.desc(), skip=skip, limit=limit)

@router.get("/semesters/active", response_model=SemesterResponse, summary="Get active semester", description="Retrieve the currently active semester. Returns 404 if no semester is active.")
async def get_active_semester(db: DbSession, current_user: CurrentUser):
    semester = await AcademicService(db).sem_repo.get_active()
    if not semester:
        from fastapi import HTTPException
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No active semester found")
    return semester

@router.get("/semesters/{semester_id}", response_model=SemesterResponse, summary="Get semester by ID", description="Retrieve detailed information about a specific semester by its UUID.")
async def get_semester(semester_id: UUID, db: DbSession, current_user: CurrentUser):
    semester = await AcademicService(db).sem_repo.get_by_id(semester_id)
    if not semester:
        from fastapi import HTTPException
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Semester not found")
    return semester

@router.post("/semesters", response_model=SemesterResponse, status_code=status.HTTP_201_CREATED, summary="Create new semester", description="Create a new academic semester. Requires admin privileges.")
async def create_semester(payload: SemesterCreate, db: DbSession, admin: AdminUser):
    return await AcademicService(db).create_semester(payload)

@router.put("/semesters/{semester_id}", response_model=SemesterResponse, summary="Update semester", description="Update an existing semester's information. Requires admin privileges.")
async def update_semester(semester_id: UUID, payload: SemesterUpdate, db: DbSession, admin: AdminUser):
    return await AcademicService(db).update_semester(semester_id, payload)

@router.put("/semesters/{semester_id}/activate", response_model=SemesterResponse, summary="Activate semester", description="Set a semester as the active semester. Deactivates any currently active semester. Requires admin privileges.")
async def activate_semester(semester_id: UUID, db: DbSession, admin: AdminUser):
    return await AcademicService(db).activate_semester(semester_id)

@router.put("/semesters/{semester_id}/archive", response_model=SemesterResponse, summary="Archive semester", description="Archive a semester to mark it as completed. Requires admin privileges.")
async def archive_semester(semester_id: UUID, db: DbSession, admin: AdminUser):
    return await AcademicService(db).archive_semester(semester_id)

@router.delete("/semesters/{semester_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete semester", description="Permanently delete a semester. This action cannot be undone. Requires admin privileges.")
async def delete_semester(semester_id: UUID, db: DbSession, admin: AdminUser):
    await AcademicService(db).delete_semester(semester_id)
    return None

# ── Departments ──────────────────────────────────────────────────────────────

@router.get("/departments", response_model=List[DepartmentResponse], summary="List all departments", description="Retrieve a paginated list of all departments. Can filter by semester.")
async def list_departments(
    db: DbSession,
    current_user: CurrentUser,
    semester_id: UUID = None,
    skip: int = Query(0, ge=0, description="Number of records to skip for pagination"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of records to return")
):
    service = AcademicService(db)
    if semester_id:
        return await service.dept_repo.get_by_semester(semester_id)
    return await service.dept_repo.get_all(skip=skip, limit=limit)

@router.get("/departments/{department_id}", response_model=DepartmentResponse, summary="Get department by ID", description="Retrieve detailed information about a specific department by its UUID.")
async def get_department(department_id: UUID, db: DbSession, current_user: CurrentUser):
    department = await AcademicService(db).dept_repo.get_by_id(department_id)
    if not department:
        from fastapi import HTTPException
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Department not found")
    return department

@router.post("/departments", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED, summary="Create new department", description="Create a new academic department. Requires admin privileges.")
async def create_department(payload: DepartmentCreate, db: DbSession, admin: AdminUser):
    return await AcademicService(db).create_department(payload)

@router.put("/departments/{department_id}", response_model=DepartmentResponse, summary="Update department", description="Update an existing department's information. Requires admin privileges.")
async def update_department(department_id: UUID, payload: DepartmentUpdate, db: DbSession, admin: AdminUser):
    return await AcademicService(db).update_department(department_id, payload)

@router.delete("/departments/{department_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete department", description="Permanently delete a department. This action cannot be undone. Requires admin privileges.")
async def delete_department(department_id: UUID, db: DbSession, admin: AdminUser):
    await AcademicService(db).delete_department(department_id)
    return None

# ── Courses ──────────────────────────────────────────────────────────────────

@router.get("/courses", response_model=List[CourseResponse], summary="List all courses", description="Retrieve a paginated list of all courses. Can filter by semester, department, or doctor.")
async def list_courses(
    semester_id: UUID = None,
    department_id: UUID = None,
    doctor_id: UUID = None,
    db: DbSession = None,
    current_user: CurrentUser = None,
    skip: int = Query(0, ge=0, description="Number of records to skip for pagination"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of records to return")
):
    service = AcademicService(db)
    if semester_id:
        return await service.course_repo.get_by_semester(semester_id, skip=skip, limit=limit)
    if doctor_id:
        return await service.course_repo.get_by_doctor(doctor_id)
    return await service.course_repo.get_all(skip=skip, limit=limit)

@router.get("/courses/{course_id}", response_model=CourseDetailResponse, summary="Get course by ID", description="Retrieve detailed information about a specific course including assigned doctors and assistants.")
async def get_course(course_id: UUID, db: DbSession, current_user: CurrentUser):
    course = await AcademicService(db).course_repo.get_with_relations(course_id)
    if not course:
        from fastapi import HTTPException
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Course not found")
    return course

@router.post("/courses", response_model=CourseResponse, status_code=status.HTTP_201_CREATED, summary="Create new course", description="Create a new academic course. Requires admin privileges.")
async def create_course(payload: CourseCreate, db: DbSession, admin: AdminUser):
    return await AcademicService(db).create_course(payload)

@router.put("/courses/{course_id}", response_model=CourseResponse, summary="Update course", description="Update an existing course's information. Requires admin privileges.")
async def update_course(course_id: UUID, payload: CourseUpdate, db: DbSession, admin: AdminUser):
    return await AcademicService(db).update_course(course_id, payload)

@router.delete("/courses/{course_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete course", description="Permanently delete a course. This action cannot be undone. Requires admin privileges.")
async def delete_course(course_id: UUID, db: DbSession, admin: AdminUser):
    await AcademicService(db).delete_course(course_id)
    return None

# ── Halls ────────────────────────────────────────────────────────────────────

@router.get("/halls", response_model=List[HallResponse], summary="List all halls", description="Retrieve a paginated list of all active halls. Can filter by hall type (lecture, lab, seminar, amphitheater).")
async def list_halls(
    db: DbSession,
    current_user: CurrentUser,
    hall_type: str = None,
    skip: int = Query(0, ge=0, description="Number of records to skip for pagination"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of records to return")
):
    service = AcademicService(db)
    if hall_type:
        return await service.hall_repo.get_by_type(hall_type)
    return await service.hall_repo.get_active()

@router.get("/halls/{hall_id}", response_model=HallResponse, summary="Get hall by ID", description="Retrieve detailed information about a specific hall by its UUID.")
async def get_hall(hall_id: UUID, db: DbSession, current_user: CurrentUser):
    hall = await AcademicService(db).hall_repo.get_by_id(hall_id)
    if not hall:
        from fastapi import HTTPException
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Hall not found")
    return hall

@router.post("/halls", response_model=HallResponse, status_code=status.HTTP_201_CREATED, summary="Create new hall", description="Create a new hall/room. Requires admin privileges.")
async def create_hall(payload: HallCreate, db: DbSession, admin: AdminUser):
    return await AcademicService(db).create_hall(payload)

@router.put("/halls/{hall_id}", response_model=HallResponse, summary="Update hall", description="Update an existing hall's information. Requires admin privileges.")
async def update_hall(hall_id: UUID, payload: HallUpdate, db: DbSession, admin: AdminUser):
    return await AcademicService(db).update_hall(hall_id, payload)

@router.delete("/halls/{hall_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete hall", description="Permanently delete a hall. This action cannot be undone. Requires admin privileges.")
async def delete_hall(hall_id: UUID, db: DbSession, admin: AdminUser):
    await AcademicService(db).delete_hall(hall_id)
    return None

# ── Availability ─────────────────────────────────────────────────────────────

@router.get("/availability", response_model=List[AvailabilityResponse], summary="Get my availability", description="Retrieve the current availability slots for the authenticated staff member (doctor or assistant).")
async def get_my_availability(db: DbSession, staff: StaffUser):
    if staff.role == UserRole.doctor:
        return await DoctorAvailabilityRepository(db).get_by_doctor(staff.id)
    else:
        return await AssistantAvailabilityRepository(db).get_by_assistant(staff.id)

@router.put("/availability", response_model=MessageResponse, summary="Set my availability", description="Update availability slots for the authenticated staff member. Replaces all existing slots with the new set.")
async def set_my_availability(payload: AvailabilityBulkSet, db: DbSession, staff: StaffUser):
    if staff.role == UserRole.doctor:
        repo = DoctorAvailabilityRepository(db)
        await repo.delete_all_for_doctor(staff.id)
        for slot in payload.slots:
            await repo.create(user_id=staff.id, **slot.model_dump())
    else:
        repo = AssistantAvailabilityRepository(db)
        slots = await repo.get_by_assistant(staff.id)
        for s in slots:
            await db.delete(s)
        await db.flush()
        for slot in payload.slots:
            await repo.create(user_id=staff.id, **slot.model_dump())

    return MessageResponse(message="Availability updated successfully")

# ── Statistics ─────────────────────────────────────────────────────────────

@router.get("/statistics/semester/{semester_id}", summary="Get semester statistics", description="Retrieve comprehensive statistics for a specific semester including courses, halls, and scheduling metrics.")
async def get_semester_statistics(semester_id: UUID, db: DbSession, current_user: CurrentUser):
    return await AcademicService(db).get_semester_statistics(semester_id)

@router.get("/statistics/department/{department_id}", summary="Get department statistics", description="Retrieve statistics for a specific department including course counts and faculty information.")
async def get_department_statistics(department_id: UUID, db: DbSession, current_user: CurrentUser):
    return await AcademicService(db).get_department_statistics(department_id)

@router.get("/statistics/hall/{hall_id}", summary="Get hall utilization", description="Retrieve utilization statistics for a specific hall during a semester.")
async def get_hall_utilization(hall_id: UUID, semester_id: UUID, db: DbSession, current_user: CurrentUser):
    return await AcademicService(db).get_hall_utilization(hall_id, semester_id)

# ── Doctor Management ───────────────────────────────────────────────────────

@router.get("/doctors", summary="List all doctors", description="Retrieve a paginated list of all doctors in the system.")
async def list_doctors(
    db: DbSession,
    current_user: CurrentUser,
    semester_id: UUID = None,
    skip: int = Query(0, ge=0, description="Number of records to skip for pagination"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of records to return")
):
    from app.repositories.user import UserRepository
    from app.models.user import UserRole
    repo = UserRepository(db)
    return await repo.get_by_role(UserRole.doctor, skip=skip, limit=limit)

@router.get("/doctors/{doctor_id}/schedule", summary="Get doctor schedule", description="Retrieve the complete schedule for a specific doctor during a semester.")
async def get_doctor_schedule(doctor_id: UUID, semester_id: UUID, db: DbSession, current_user: CurrentUser):
    from app.repositories.academic import ScheduleRepository
    repo = ScheduleRepository(db)
    return await repo.get_by_doctor(doctor_id, semester_id)

@router.get("/doctors/{doctor_id}/workload", summary="Get doctor workload", description="Retrieve workload statistics for a specific doctor including courses, lectures, sections, and scheduled hours.")
async def get_doctor_workload(doctor_id: UUID, semester_id: UUID, db: DbSession, current_user: CurrentUser):
    from app.repositories.academic import CourseRepository, ScheduleRepository
    course_repo = CourseRepository(db)
    schedule_repo = ScheduleRepository(db)

    courses = await course_repo.get_by_doctor(doctor_id)
    schedule = await schedule_repo.get_by_doctor(doctor_id, semester_id)

    total_lectures = sum(c.lecture_count for c in courses)
    total_sections = sum(c.section_count for c in courses)
    scheduled_hours = len(schedule) * 2  # Assuming 2-hour slots

    return {
        "doctor_id": str(doctor_id),
        "total_courses": len(courses),
        "total_lectures": total_lectures,
        "total_sections": total_sections,
        "scheduled_hours": scheduled_hours,
        "courses": [{"id": str(c.id), "name": c.name, "code": c.code} for c in courses]
    }

# ── Assistant Management ───────────────────────────────────────────────────

@router.get("/assistants", summary="List all assistants", description="Retrieve a paginated list of all teaching assistants in the system.")
async def list_assistants(
    db: DbSession,
    current_user: CurrentUser,
    skip: int = Query(0, ge=0, description="Number of records to skip for pagination"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of records to return")
):
    from app.repositories.user import UserRepository
    from app.models.user import UserRole
    repo = UserRepository(db)
    return await repo.get_by_role(UserRole.assistant, skip=skip, limit=limit)

@router.get("/students", summary="List all students", description="Retrieve a paginated list of all students in the system.")
async def list_students(
    db: DbSession,
    current_user: CurrentUser,
    skip: int = Query(0, ge=0, description="Number of records to skip for pagination"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of records to return")
):
    from app.repositories.user import UserRepository
    from app.models.user import UserRole
    repo = UserRepository(db)
    return await repo.get_by_role(UserRole.student, skip=skip, limit=limit)

@router.get("/assistants/{assistant_id}/assignments", summary="Get assistant assignments", description="Retrieve all course assignments for a specific teaching assistant during a semester.")
async def get_assistant_assignments(assistant_id: UUID, semester_id: UUID, db: DbSession, current_user: CurrentUser):
    from app.models.academic import CourseAssistant
    from sqlalchemy import select
    from app.models.academic import Course

    result = await db.execute(
        select(CourseAssistant)
        .join(Course, CourseAssistant.course_id == Course.id)
        .where(CourseAssistant.assistant_id == assistant_id, Course.semester_id == semester_id)
    )
    assignments = list(result.scalars().all())

    return [
        {
            "assignment_id": str(a.id),
            "course_id": str(a.course_id),
            "section_group": a.section_group
        }
        for a in assignments
    ]

@router.post("/courses/{course_id}/assign-doctor", summary="Assign doctor to course", description="Assign a doctor as the primary instructor for a course. Requires admin privileges.")
async def assign_doctor_to_course(
    course_id: UUID,
    doctor_id: UUID,
    db: DbSession,
    admin: AdminUser
):
    return await AcademicService(db).assign_doctor(course_id, doctor_id)

@router.post("/courses/{course_id}/assign-assistant", summary="Assign assistant to course", description="Assign a teaching assistant to a course for a specific section group. Requires admin privileges.")
async def assign_assistant_to_course(
    course_id: UUID,
    assistant_id: UUID,
    db: DbSession,
    admin: AdminUser,
    section_group: int = None
):
    await AcademicService(db).assign_assistant(course_id, assistant_id, section_group)
    return {"message": "Assistant assigned successfully"}

# ── Schedule Management ─────────────────────────────────────────────────────

@router.post("/schedule/generate", summary="Generate schedule", description="Trigger the AI timetable generator to create an optimized schedule for a semester using OR-Tools CP-SAT solver. Requires admin privileges.")
async def generate_schedule(
    semester_id: UUID,
    optimize_for: str = Query("balanced", description="Optimization strategy: balanced, compact, or spread"),
    max_solve_time: float = Query(30.0, description="Maximum solve time in seconds"),
    db: DbSession = None,
    admin: AdminUser = None
):
    from app.services.scheduler import SchedulerService
    service = SchedulerService(db)
    return await service.generate_schedule(semester_id, optimize_for, max_solve_time)

@router.post("/schedule/generate-sections/{course_id}", summary="Generate section schedule", description="Generate section/lab schedules for a specific course using the AI scheduler. Requires admin privileges.")
async def generate_section_schedule(
    course_id: UUID,
    semester_id: UUID,
    max_solve_time: float = Query(15.0, description="Maximum solve time in seconds"),
    db: DbSession = None,
    admin: AdminUser = None
):
    from app.services.scheduler import SchedulerService
    service = SchedulerService(db)
    return await service.generate_section_schedule(semester_id, course_id, max_solve_time)

@router.get("/schedule/validate/{semester_id}", summary="Validate schedule", description="Validate an existing schedule to detect conflicts and constraint violations.")
async def validate_schedule(semester_id: UUID, db: DbSession, current_user: CurrentUser):
    from app.services.scheduler import SchedulerService
    service = SchedulerService(db)
    return await service.validate_schedule(semester_id)

@router.get("/schedule/{semester_id}", summary="Get schedule by semester", description="Retrieve the complete generated schedule for a specific semester.")
async def get_schedule(semester_id: UUID, db: DbSession, current_user: CurrentUser):
    from app.repositories.academic import ScheduleRepository
    repo = ScheduleRepository(db)
    return await repo.get_by_semester(semester_id)

# ── Admin Dashboard ────────────────────────────────────────────────────────

@router.get("/dashboard/overview", summary="Get dashboard overview", description="Retrieve comprehensive dashboard statistics including semester counts, department counts, course counts, hall counts, and user statistics. Requires admin privileges.")
async def get_dashboard_overview(db: DbSession, admin: AdminUser):
    """Get comprehensive dashboard statistics for admin."""
    from app.repositories.academic import SemesterRepository, DepartmentRepository, CourseRepository, HallRepository
    from app.repositories.user import UserRepository

    sem_repo = SemesterRepository(db)
    dept_repo = DepartmentRepository(db)
    course_repo = CourseRepository(db)
    hall_repo = HallRepository(db)
    user_repo = UserRepository(db)

    # Get counts
    total_semesters = len(await sem_repo.get_all(limit=1000))
    active_semester = await sem_repo.get_active()
    total_departments = len(await dept_repo.get_all(limit=1000))
    total_courses = len(await course_repo.get_all(limit=1000))
    total_halls = len(await hall_repo.get_all(limit=1000))

    # Get user counts
    from app.models.user import UserRole
    total_doctors = len(await user_repo.get_by_role(UserRole.doctor, limit=1000))
    total_assistants = len(await user_repo.get_by_role(UserRole.assistant, limit=1000))
    total_students = len(await user_repo.get_by_role(UserRole.student, limit=1000))

    # Get recent activity
    recent_semesters = await sem_repo.get_all(order_by=sem_repo.model.created_at.desc(), limit=5)

    return {
        "overview": {
            "total_semesters": total_semesters,
            "active_semester": {
                "id": str(active_semester.id) if active_semester else None,
                "name": active_semester.name if active_semester else None,
                "academic_year": active_semester.academic_year if active_semester else None
            } if active_semester else None,
            "total_departments": total_departments,
            "total_courses": total_courses,
            "total_halls": total_halls
        },
        "user_statistics": {
            "total_doctors": total_doctors,
            "total_assistants": total_assistants,
            "total_students": total_students
        },
        "recent_semesters": [
            {
                "id": str(s.id),
                "name": s.name,
                "academic_year": s.academic_year,
                "status": s.status.value,
                "is_active": s.is_active
            }
            for s in recent_semesters
        ]
    }

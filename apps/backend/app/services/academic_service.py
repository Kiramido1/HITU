"""Academic service — business logic for semesters, departments, and courses."""
from typing import Dict, Any
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import HTTPException, status

from app.models.academic import Course, Department, Hall, Semester, SemesterStatus
from app.repositories.academic import (
    CourseRepository, DepartmentRepository, HallRepository, SemesterRepository
)
from app.schemas.academic import (
    CourseCreate, CourseUpdate, DepartmentCreate, DepartmentUpdate,
    HallCreate, HallUpdate, SemesterCreate, SemesterUpdate
)


class AcademicService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.sem_repo = SemesterRepository(db)
        self.dept_repo = DepartmentRepository(db)
        self.course_repo = CourseRepository(db)
        self.hall_repo = HallRepository(db)

    # ── Semester ────────────────────────────────────────────────────────────

    async def activate_semester(self, semester_id: UUID) -> Semester:
        semester = await self.sem_repo.activate(semester_id)
        if not semester:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Semester not found")
        return semester

    async def create_semester(self, data: SemesterCreate) -> Semester:
        return await self.sem_repo.create(**data.model_dump())

    async def update_semester(self, semester_id: UUID, data: SemesterUpdate) -> Semester:
        semester = await self.sem_repo.get_by_id(semester_id)
        if not semester:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Semester not found")
        return await self.sem_repo.update(semester, **data.model_dump(exclude_unset=True))

    async def archive_semester(self, semester_id: UUID) -> Semester:
        semester = await self.sem_repo.get_by_id(semester_id)
        if not semester:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Semester not found")
        semester.status = SemesterStatus.archived
        semester.is_active = False
        await self.db.flush()
        return semester

    async def delete_semester(self, semester_id: UUID) -> None:
        semester = await self.sem_repo.get_by_id(semester_id)
        if not semester:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Semester not found")
        await self.sem_repo.delete(semester)

    async def get_semester_statistics(self, semester_id: UUID) -> Dict[str, Any]:
        semester = await self.sem_repo.get_by_id(semester_id)
        if not semester:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Semester not found")

        courses = await self.course_repo.get_by_semester(semester_id, limit=1000)
        departments = await self.dept_repo.get_by_semester(semester_id)

        total_students = sum(c.student_count for c in courses)
        total_credit_hours = sum(c.credit_hours for c in courses)
        total_lectures = sum(c.lecture_count for c in courses)
        total_sections = sum(c.section_count for c in courses)

        return {
            "semester_id": str(semester_id),
            "semester_name": semester.name,
            "total_courses": len(courses),
            "total_departments": len(departments),
            "total_students": total_students,
            "total_credit_hours": total_credit_hours,
            "total_lectures": total_lectures,
            "total_sections": total_sections,
            "status": semester.status,
            "is_active": semester.is_active
        }

    # ── Department ──────────────────────────────────────────────────────────

    async def create_department(self, data: DepartmentCreate) -> Department:
        if await self.dept_repo.get_by_code(data.code):
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Department code exists")
        return await self.dept_repo.create(**data.model_dump())

    async def update_department(self, dept_id: UUID, data: DepartmentUpdate) -> Department:
        dept = await self.dept_repo.get_by_id(dept_id)
        if not dept:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Department not found")
        return await self.dept_repo.update(dept, **data.model_dump(exclude_unset=True))

    async def delete_department(self, dept_id: UUID) -> None:
        dept = await self.dept_repo.get_by_id(dept_id)
        if not dept:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Department not found")
        await self.dept_repo.delete(dept)

    async def get_department_statistics(self, department_id: UUID) -> Dict[str, Any]:
        dept = await self.dept_repo.get_by_id(department_id)
        if not dept:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Department not found")

        courses = await self.db.execute(
            select(Course).where(Course.department_id == department_id)
        )
        courses = list(courses.scalars().all())

        return {
            "department_id": str(department_id),
            "department_name": dept.name,
            "department_code": dept.code,
            "total_courses": len(courses),
            "total_students": dept.student_count,
            "head_of_department": dept.head_of_department
        }

    # ── Course ──────────────────────────────────────────────────────────────

    async def create_course(self, data: CourseCreate) -> Course:
        if data.semester_id:
            sem = await self.sem_repo.get_by_id(data.semester_id)
            if not sem:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Semester not found")
        if data.department_id:
            dept = await self.dept_repo.get_by_id(data.department_id)
            if not dept:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Department not found")
        return await self.course_repo.create(**data.model_dump())

    async def update_course(self, course_id: UUID, data: CourseUpdate) -> Course:
        course = await self.course_repo.get_by_id(course_id)
        if not course:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Course not found")
        return await self.course_repo.update(course, **data.model_dump(exclude_unset=True))

    async def delete_course(self, course_id: UUID) -> None:
        course = await self.course_repo.get_by_id(course_id)
        if not course:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Course not found")
        await self.course_repo.delete(course)

    async def assign_doctor(self, course_id: UUID, doctor_id: UUID) -> Course:
        course = await self.course_repo.get_by_id(course_id)
        if not course:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Course not found")
        course.doctor_id = doctor_id
        await self.db.flush()
        return course

    async def assign_assistant(self, course_id: UUID, assistant_id: UUID, section_group: int = None) -> None:
        from app.models.academic import CourseAssistant
        from app.models.user import User

        course = await self.course_repo.get_by_id(course_id)
        if not course:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Course not found")

        assistant = await self.db.execute(select(User).where(User.id == assistant_id))
        assistant = assistant.scalar_one_or_none()
        if not assistant:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Assistant not found")

        assignment = CourseAssistant(
            course_id=course_id,
            assistant_id=assistant_id,
            section_group=section_group
        )
        self.db.add(assignment)
        await self.db.flush()

    # ── Hall ────────────────────────────────────────────────────────────────

    async def create_hall(self, data: HallCreate) -> Hall:
        return await self.hall_repo.create(**data.model_dump())

    async def update_hall(self, hall_id: UUID, data: HallUpdate) -> Hall:
        hall = await self.hall_repo.get_by_id(hall_id)
        if not hall:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Hall not found")
        return await self.hall_repo.update(hall, **data.model_dump(exclude_unset=True))

    async def delete_hall(self, hall_id: UUID) -> None:
        hall = await self.hall_repo.get_by_id(hall_id)
        if not hall:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Hall not found")
        await self.hall_repo.delete(hall)

    async def get_hall_utilization(self, hall_id: UUID, semester_id: UUID) -> Dict[str, Any]:
        from app.models.academic import ScheduleEntry

        hall = await self.hall_repo.get_by_id(hall_id)
        if not hall:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Hall not found")

        schedule = await self.db.execute(
            select(ScheduleEntry).where(
                ScheduleEntry.hall_id == hall_id,
                ScheduleEntry.semester_id == semester_id
            )
        )
        schedule_entries = list(schedule.scalars().all())

        total_slots = 30  # 6 days * 5 slots
        utilized_slots = len(schedule_entries)
        utilization_rate = (utilized_slots / total_slots) * 100 if total_slots > 0 else 0

        return {
            "hall_id": str(hall_id),
            "hall_name": hall.name,
            "hall_capacity": hall.capacity,
            "hall_type": hall.hall_type,
            "total_slots": total_slots,
            "utilized_slots": utilized_slots,
            "utilization_rate": round(utilization_rate, 2),
            "available_slots": total_slots - utilized_slots
        }

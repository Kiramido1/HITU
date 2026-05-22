"""Academic repositories — Semester, Department, Course, Hall, Availability, Schedule."""
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.academic import (
    AssistantAvailability, Course, Department, DoctorAvailability,
    Hall, ScheduleEntry, Semester, SemesterStatus
)
from app.repositories.base import BaseRepository


class SemesterRepository(BaseRepository[Semester]):
    model = Semester

    async def get_active(self) -> Optional[Semester]:
        result = await self.session.execute(
            select(Semester).where(Semester.is_active.is_(True))
        )
        return result.scalar_one_or_none()

    async def get_by_status(self, status: SemesterStatus) -> List[Semester]:
        result = await self.session.execute(
            select(Semester).where(Semester.status == status).order_by(Semester.created_at.desc())
        )
        return list(result.scalars().all())

    async def activate(self, semester_id: UUID) -> Optional[Semester]:
        """Deactivate all, then activate the given semester."""
        all_sems = await self.get_all()
        for s in all_sems:
            s.is_active = False
            self.session.add(s)
        semester = await self.get_by_id(semester_id)
        if semester:
            semester.is_active = True
            semester.status = SemesterStatus.active
            self.session.add(semester)
            await self.session.flush()
        return semester


class DepartmentRepository(BaseRepository[Department]):
    model = Department

    async def get_by_semester(self, semester_id: UUID) -> List[Department]:
        result = await self.session.execute(
            select(Department).where(Department.semester_id == semester_id)
        )
        return list(result.scalars().all())

    async def get_by_code(self, code: str) -> Optional[Department]:
        result = await self.session.execute(
            select(Department).where(Department.code == code.upper())
        )
        return result.scalar_one_or_none()


class CourseRepository(BaseRepository[Course]):
    model = Course

    async def get_by_semester(self, semester_id: UUID, *, skip: int = 0, limit: int = 50) -> List[Course]:
        result = await self.session.execute(
            select(Course)
            .where(Course.semester_id == semester_id, Course.is_active.is_(True))
            .options(selectinload(Course.doctor), selectinload(Course.department))
            .offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    async def get_by_doctor(self, doctor_id: UUID) -> List[Course]:
        result = await self.session.execute(
            select(Course).where(Course.doctor_id == doctor_id, Course.is_active.is_(True))
        )
        return list(result.scalars().all())

    async def get_by_department_code(self, dept_code: str, semester_id: Optional[UUID] = None) -> List[Course]:
        stmt = (
            select(Course)
            .join(Department, Course.department_id == Department.id)
            .where(Department.code == dept_code.upper(), Course.is_active.is_(True))
            .options(selectinload(Course.department))
        )
        if semester_id:
            stmt = stmt.where(Course.semester_id == semester_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_assistant(self, assistant_id: UUID) -> List[Course]:
        from app.models.academic import CourseAssistant
        result = await self.session.execute(
            select(Course)
            .join(CourseAssistant, CourseAssistant.course_id == Course.id)
            .where(CourseAssistant.assistant_id == assistant_id, Course.is_active.is_(True))
            .options(selectinload(Course.department))
        )
        return list(result.scalars().all())

    async def get_with_relations(self, course_id: UUID) -> Optional[Course]:
        result = await self.session.execute(
            select(Course)
            .where(Course.id == course_id)
            .options(
                selectinload(Course.doctor),
                selectinload(Course.department),
                selectinload(Course.course_assistants),
            )
        )
        return result.scalar_one_or_none()


class HallRepository(BaseRepository[Hall]):
    model = Hall

    async def get_active(self) -> List[Hall]:
        result = await self.session.execute(
            select(Hall).where(Hall.is_active.is_(True)).order_by(Hall.capacity.desc())
        )
        return list(result.scalars().all())

    async def get_by_type(self, hall_type: str) -> List[Hall]:
        result = await self.session.execute(
            select(Hall).where(Hall.hall_type == hall_type, Hall.is_active.is_(True))
        )
        return list(result.scalars().all())


class DoctorAvailabilityRepository(BaseRepository[DoctorAvailability]):
    model = DoctorAvailability

    async def get_by_doctor(self, doctor_id: UUID) -> List[DoctorAvailability]:
        result = await self.session.execute(
            select(DoctorAvailability).where(DoctorAvailability.user_id == doctor_id)
        )
        return list(result.scalars().all())

    async def delete_all_for_doctor(self, doctor_id: UUID) -> None:
        slots = await self.get_by_doctor(doctor_id)
        for slot in slots:
            await self.session.delete(slot)
        await self.session.flush()


class AssistantAvailabilityRepository(BaseRepository[AssistantAvailability]):
    model = AssistantAvailability

    async def get_by_assistant(self, assistant_id: UUID) -> List[AssistantAvailability]:
        result = await self.session.execute(
            select(AssistantAvailability).where(AssistantAvailability.user_id == assistant_id)
        )
        return list(result.scalars().all())


class ScheduleRepository(BaseRepository[ScheduleEntry]):
    model = ScheduleEntry

    async def get_by_semester(self, semester_id: UUID) -> List[ScheduleEntry]:
        result = await self.session.execute(
            select(ScheduleEntry)
            .where(ScheduleEntry.semester_id == semester_id)
            .options(
                selectinload(ScheduleEntry.course),
                selectinload(ScheduleEntry.hall),
                selectinload(ScheduleEntry.doctor),
                selectinload(ScheduleEntry.assistant),
            )
            .order_by(ScheduleEntry.day_of_week, ScheduleEntry.start_time)
        )
        return list(result.scalars().all())

    async def get_by_doctor(self, doctor_id: UUID, semester_id: UUID) -> List[ScheduleEntry]:
        result = await self.session.execute(
            select(ScheduleEntry).where(
                ScheduleEntry.doctor_id == doctor_id,
                ScheduleEntry.semester_id == semester_id,
            )
        )
        return list(result.scalars().all())

    async def delete_ai_generated(self, semester_id: UUID) -> int:
        """Remove AI-generated entries before re-run."""
        entries = await self.session.execute(
            select(ScheduleEntry).where(
                ScheduleEntry.semester_id == semester_id,
                ScheduleEntry.ai_generated.is_(True),
            )
        )
        rows = list(entries.scalars().all())
        for row in rows:
            await self.session.delete(row)
        await self.session.flush()
        return len(rows)

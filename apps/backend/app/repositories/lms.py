"""LMS repositories — Material, Assignment, Submission, Notification."""
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.lms import Assignment, Material, Notification, Submission
from app.repositories.base import BaseRepository


class MaterialRepository(BaseRepository[Material]):
    model = Material

    async def get_by_course(self, course_id: UUID, *, published_only: bool = True) -> List[Material]:
        stmt = select(Material).where(Material.course_id == course_id)
        if published_only:
            stmt = stmt.where(Material.is_published.is_(True))
        result = await self.session.execute(stmt.order_by(Material.week_number, Material.created_at))
        return list(result.scalars().all())


class AssignmentRepository(BaseRepository[Assignment]):
    model = Assignment

    async def get_by_course(self, course_id: UUID, *, published_only: bool = False) -> List[Assignment]:
        stmt = select(Assignment).where(Assignment.course_id == course_id)
        if published_only:
            stmt = stmt.where(Assignment.is_published.is_(True))
        result = await self.session.execute(stmt.order_by(Assignment.deadline))
        return list(result.scalars().all())

    async def get_with_submissions(self, assignment_id: UUID) -> Optional[Assignment]:
        result = await self.session.execute(
            select(Assignment)
            .where(Assignment.id == assignment_id)
            .options(selectinload(Assignment.submissions))
        )
        return result.scalar_one_or_none()


class SubmissionRepository(BaseRepository[Submission]):
    model = Submission

    async def get_by_assignment(self, assignment_id: UUID) -> List[Submission]:
        result = await self.session.execute(
            select(Submission)
            .where(Submission.assignment_id == assignment_id)
            .options(selectinload(Submission.student))
        )
        return list(result.scalars().all())

    async def get_by_student(self, student_id: UUID, assignment_id: UUID) -> Optional[Submission]:
        result = await self.session.execute(
            select(Submission).where(
                Submission.student_id == student_id,
                Submission.assignment_id == assignment_id,
            )
        )
        return result.scalar_one_or_none()


class NotificationRepository(BaseRepository[Notification]):
    model = Notification

    async def get_for_user(self, user_id: UUID, *, unread_only: bool = False, limit: int = 50) -> List[Notification]:
        stmt = select(Notification).where(Notification.user_id == user_id)
        if unread_only:
            stmt = stmt.where(Notification.is_read.is_(False))
        result = await self.session.execute(
            stmt.order_by(Notification.created_at.desc()).limit(limit)
        )
        return list(result.scalars().all())

    async def mark_all_read(self, user_id: UUID) -> int:
        notifs = await self.get_for_user(user_id, unread_only=True)
        for n in notifs:
            n.is_read = True
            self.session.add(n)
        await self.session.flush()
        return len(notifs)

    async def unread_count(self, user_id: UUID) -> int:
        return await self.count(filters=[
            Notification.user_id == user_id,
            Notification.is_read.is_(False),
        ])

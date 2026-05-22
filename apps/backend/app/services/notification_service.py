"""Notification service — create and manage notifications."""
from typing import List
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lms import Notification
from app.repositories.lms import NotificationRepository
from app.schemas.lms import NotificationCreate


class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = NotificationRepository(db)

    async def send(self, data: NotificationCreate) -> Notification:
        return await self.repo.create(**data.model_dump())

    async def get_user_notifications(self, user_id: UUID, unread_only: bool = False) -> List[Notification]:
        return await self.repo.get_for_user(user_id, unread_only=unread_only)

    async def mark_read(self, user_id: UUID, notification_id: UUID) -> bool:
        n = await self.repo.get_by_id(notification_id)
        if n and n.user_id == user_id:
            n.is_read = True
            await self.repo.save(n)
            return True
        return False

    async def mark_all_read(self, user_id: UUID) -> int:
        return await self.repo.mark_all_read(user_id)

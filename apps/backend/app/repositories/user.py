"""User repository — email lookup, role filtering, search."""
from typing import List, Optional
from sqlalchemy import select

from app.models.user import User, UserRole
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    model = User

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.session.execute(
            select(User).where(User.email == email.lower().strip())
        )
        return result.scalar_one_or_none()

    async def get_by_role(self, role: UserRole, *, skip: int = 0, limit: int = 50) -> List[User]:
        result = await self.session.execute(
            select(User).where(User.role == role, User.is_active.is_(True))
            .offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    async def search(self, query: str, *, limit: int = 20) -> List[User]:
        q = f"%{query}%"
        result = await self.session.execute(
            select(User).where(
                (User.full_name.ilike(q)) | (User.email.ilike(q))
            ).limit(limit)
        )
        return list(result.scalars().all())

    async def email_exists(self, email: str) -> bool:
        result = await self.session.execute(
            select(User.id).where(User.email == email.lower().strip())
        )
        return result.scalar_one_or_none() is not None

"""User service — business logic for user management."""
from typing import List, Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.repositories.user import UserRepository
from app.schemas.user import UserCreate, UserUpdate, UserAdminUpdate


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = UserRepository(db)

    async def get_by_email(self, email: str) -> Optional[User]:
        return await self.repo.get_by_email(email)

    async def get_user_or_404(self, user_id: UUID) -> User:
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user

    async def create_user(self, data: UserCreate) -> User:
        if await self.repo.email_exists(data.email):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

        user_dict = data.model_dump()
        user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
        return await self.repo.create(**user_dict)

    async def update_profile(self, user_id: UUID, data: UserUpdate) -> User:
        user = await self.get_user_or_404(user_id)
        update_data = data.model_dump(exclude_unset=True)
        return await self.repo.update(user, **update_data)

    async def update_user_admin(self, user_id: UUID, data: UserAdminUpdate) -> User:
        user = await self.get_user_or_404(user_id)
        update_data = data.model_dump(exclude_unset=True)
        return await self.repo.update(user, **update_data)

    async def deactivate_user(self, user_id: UUID) -> None:
        user = await self.get_user_or_404(user_id)
        if user.role == UserRole.admin:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot deactivate an admin")
        await self.repo.update(user, is_active=False)

    async def search_users(self, query: str, limit: int = 20) -> List[User]:
        return await self.repo.search(query, limit=limit)

"""
Generic async base repository.
Provides type-safe CRUD operations for all models.
"""
from typing import Any, Dict, Generic, List, Optional, Type, TypeVar
from uuid import UUID

from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.base import Base

ModelT = TypeVar("ModelT", bound=Base)


class BaseRepository(Generic[ModelT]):
    """
    Generic async repository implementing standard CRUD.
    Subclass and set `model` to the SQLAlchemy model class.
    """
    model: Type[ModelT]

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    # ── Read ────────────────────────────────────────────────────────────────

    async def get_by_id(self, id: UUID) -> Optional[ModelT]:
        result = await self.session.get(self.model, id)
        return result

    async def get_all(
        self,
        *,
        skip: int = 0,
        limit: int = 20,
        filters: Optional[List] = None,
        order_by: Optional[Any] = None,
    ) -> List[ModelT]:
        stmt: Select = select(self.model)
        if filters:
            for f in filters:
                stmt = stmt.where(f)
        if order_by is not None:
            stmt = stmt.order_by(order_by)
        stmt = stmt.offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def count(self, filters: Optional[List] = None) -> int:
        stmt = select(func.count()).select_from(self.model)
        if filters:
            for f in filters:
                stmt = stmt.where(f)
        result = await self.session.execute(stmt)
        return result.scalar_one()

    # ── Write ───────────────────────────────────────────────────────────────

    async def create(self, **kwargs: Any) -> ModelT:
        instance = self.model(**kwargs)
        self.session.add(instance)
        await self.session.flush()
        await self.session.refresh(instance)
        return instance

    async def update(self, instance: ModelT, **kwargs: Any) -> ModelT:
        for key, value in kwargs.items():
            if hasattr(instance, key):
                setattr(instance, key, value)
        self.session.add(instance)
        await self.session.flush()
        await self.session.refresh(instance)
        return instance

    async def delete(self, instance: ModelT) -> None:
        await self.session.delete(instance)
        await self.session.flush()

    async def save(self, instance: ModelT) -> ModelT:
        self.session.add(instance)
        await self.session.flush()
        await self.session.refresh(instance)
        return instance

    # ── Helpers ─────────────────────────────────────────────────────────────

    async def paginate(
        self,
        *,
        page: int = 1,
        page_size: int = 20,
        filters: Optional[List] = None,
        order_by: Optional[Any] = None,
    ) -> Dict[str, Any]:
        skip = (page - 1) * page_size
        total = await self.count(filters=filters)
        items = await self.get_all(skip=skip, limit=page_size, filters=filters, order_by=order_by)
        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "pages": (total + page_size - 1) // page_size,
        }

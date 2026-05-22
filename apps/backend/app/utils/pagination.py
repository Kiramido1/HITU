"""
Pagination utilities — FastAPI dependency and helper.
"""
from typing import Any, Dict, List
from fastapi import Query
from pydantic import BaseModel

from app.core.config import settings


class PaginationParams(BaseModel):
    page: int = 1
    page_size: int = settings.DEFAULT_PAGE_SIZE

    class Config:
        arbitrary_types_allowed = True


def get_pagination(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(
        settings.DEFAULT_PAGE_SIZE, ge=1, le=settings.MAX_PAGE_SIZE,
        description="Items per page"
    ),
) -> PaginationParams:
    return PaginationParams(page=page, page_size=page_size)


def paginate_response(
    items: List[Any],
    total: int,
    page: int,
    page_size: int,
) -> Dict[str, Any]:
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": max(1, (total + page_size - 1) // page_size),
    }

"""
Common Pydantic schemas — pagination, error responses, success envelopes.
"""
from typing import Generic, List, Optional, TypeVar
from pydantic import BaseModel, ConfigDict

DataT = TypeVar("DataT")


class PaginatedResponse(BaseModel, Generic[DataT]):
    """Standard paginated response envelope."""
    items: List[DataT]
    total: int
    page: int
    page_size: int
    pages: int

    model_config = ConfigDict(from_attributes=True)


class SuccessResponse(BaseModel):
    success: bool = True
    message: str


class MessageResponse(BaseModel):
    message: str


class ErrorDetail(BaseModel):
    field: Optional[str] = None
    message: str


class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    errors: Optional[List[ErrorDetail]] = None
    code: Optional[str] = None

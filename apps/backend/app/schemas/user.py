"""User Pydantic schemas — request validation and response serialization."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.user import UserRole


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=150)
    arabic_name: Optional[str] = Field(None, max_length=150)
    role: UserRole = UserRole.student
    department: Optional[str] = Field(None, max_length=100)
    student_id: Optional[str] = Field(None, max_length=50)
    faculty_id: Optional[str] = Field(None, max_length=50)


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100)


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=150)
    arabic_name: Optional[str] = None
    department: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=500)
    phone: Optional[str] = Field(None, max_length=20)


class UserAdminUpdate(UserUpdate):
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None


class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    arabic_name: Optional[str] = None
    role: UserRole
    department: Optional[str] = None
    student_id: Optional[str] = None
    faculty_id: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    is_active: bool
    is_verified: bool
    last_login: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserListResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    role: UserRole
    department: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class RefreshRequest(BaseModel):
    refresh_token: str


class MessageResponse(BaseModel):
    message: str
    success: bool = True


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)

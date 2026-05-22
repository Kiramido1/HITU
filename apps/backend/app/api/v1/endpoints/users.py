"""
Users router — Admin management of users and user profile updates.
"""
from typing import List
from uuid import UUID

from fastapi import APIRouter

from app.core.dependencies import AdminUser, CurrentUser, DbSession
from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.user import UserAdminUpdate, UserListResponse, UserResponse, UserUpdate
from app.services.user_service import UserService
from app.utils.pagination import PaginationParams, get_pagination
from fastapi import Depends

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=PaginatedResponse[UserListResponse], summary="List all users", description="Retrieve a paginated list of all users in the system. Requires admin privileges.")
async def list_users(
    db: DbSession,
    admin: AdminUser,
    pagination: PaginationParams = Depends(get_pagination)
):
    service = UserService(db)
    result = await service.repo.paginate(
        page=pagination.page,
        page_size=pagination.page_size
    )
    return result


@router.get("/search", response_model=List[UserListResponse], summary="Search users", description="Search for users by name, email, or student ID. Requires admin privileges.")
async def search_users(
    q: str,
    db: DbSession,
    admin: AdminUser,
):
    service = UserService(db)
    return await service.search_users(q)


@router.get("/{user_id}", response_model=UserResponse, summary="Get user by ID", description="Retrieve detailed information about a specific user by their UUID. Requires admin privileges.")
async def get_user(user_id: UUID, db: DbSession, admin: AdminUser):
    service = UserService(db)
    return await service.get_user_or_404(user_id)


@router.put("/me", response_model=UserResponse, summary="Update my profile", description="Update the authenticated user's own profile information.")
async def update_my_profile(
    payload: UserUpdate,
    db: DbSession,
    current_user: CurrentUser
):
    service = UserService(db)
    return await service.update_profile(current_user.id, payload)


@router.put("/{user_id}", response_model=UserResponse, summary="Update user", description="Update a user's information including role and status. Requires admin privileges.")
async def update_user(
    user_id: UUID,
    payload: UserAdminUpdate,
    db: DbSession,
    admin: AdminUser
):
    service = UserService(db)
    return await service.update_user_admin(user_id, payload)


@router.delete("/{user_id}", response_model=MessageResponse, summary="Deactivate user", description="Deactivate a user account. This action can be reversed by reactivating the user. Requires admin privileges.")
async def deactivate_user(user_id: UUID, db: DbSession, admin: AdminUser):
    service = UserService(db)
    await service.deactivate_user(user_id)
    return MessageResponse(message="User deactivated successfully")

"""
FastAPI dependency injection — async DB session, current user, role guards.
All role guards are FastAPI dependencies for clean, declarative route protection.
"""
from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_token
from app.database.session import get_async_db
from app.models.user import User, UserRole
from app.repositories.user import UserRepository

security = HTTPBearer()

# ── Database ─────────────────────────────────────────────────────────────────

DbSession = Annotated[AsyncSession, Depends(get_async_db)]


# ── Current User ─────────────────────────────────────────────────────────────

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_async_db),
) -> User:
    token = credentials.credentials
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    repo = UserRepository(db)
    user = await repo.get_by_id(UUID(user_id))

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


# ── Role Guards ───────────────────────────────────────────────────────────────

def require_roles(*roles: UserRole):
    """Factory: creates a dependency that requires one of the given roles."""
    async def _guard(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role(s): {[r.value for r in roles]}",
            )
        return current_user
    return _guard


AdminUser    = Annotated[User, Depends(require_roles(UserRole.admin))]
DoctorUser   = Annotated[User, Depends(require_roles(UserRole.admin, UserRole.doctor))]
StaffUser    = Annotated[User, Depends(require_roles(UserRole.admin, UserRole.doctor, UserRole.assistant))]
StudentUser  = Annotated[User, Depends(require_roles(UserRole.student))]

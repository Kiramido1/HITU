"""
Auth router — Login, Registration, Token Refresh.
"""
from fastapi import APIRouter, status

from app.core.dependencies import DbSession, CurrentUser
from app.core.security import create_access_token, create_refresh_token, verify_password
from app.models.user import User
from app.schemas.user import (
    LoginRequest, MessageResponse, TokenResponse, UserCreate,
    UserResponse, RefreshRequest
)
from app.services.user_service import UserService
from app.core.security import decode_token
from fastapi import HTTPException

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED, summary="Register new user", description="Create a new user account and return authentication tokens. The user will be created with the specified role (student, doctor, or assistant).")
async def register(payload: UserCreate, db: DbSession):
    service = UserService(db)
    user = await service.create_user(payload)

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=30 * 60,
        user=user
    )


@router.post("/login", response_model=TokenResponse, summary="Login user", description="Authenticate a user with email and password. Returns access and refresh tokens along with user information.")
async def login(payload: LoginRequest, db: DbSession):
    service = UserService(db)
    user = await service.get_by_email(payload.email)

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid university email or password."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated."
        )

    # Update last login
    from datetime import datetime, timezone
    user.last_login = datetime.now(timezone.utc)
    await db.commit()

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=30 * 60,
        user=user
    )


@router.post("/refresh", response_model=TokenResponse, summary="Refresh access token", description="Use a valid refresh token to obtain a new access token and refresh token pair.")
async def refresh_token(payload: RefreshRequest, db: DbSession):
    decoded = decode_token(payload.refresh_token)
    if not decoded or decoded.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    service = UserService(db)
    try:
        from uuid import UUID
        user = await service.get_user_or_404(UUID(decoded.get("sub")))
    except Exception:
        raise HTTPException(status_code=401, detail="User not found")

    if not user.is_active:
        raise HTTPException(status_code=401, detail="User inactive")

    access_token = create_access_token({"sub": str(user.id)})
    new_refresh = create_refresh_token({"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh,
        expires_in=30 * 60,
        user=user
    )


@router.get("/me", response_model=UserResponse, summary="Get current user", description="Retrieve the profile information of the currently authenticated user.")
async def get_me(current_user: CurrentUser):
    return current_user


@router.post("/logout", response_model=MessageResponse, summary="Logout user", description="Logout the current user. This is a client-side action to clear tokens.")
async def logout(current_user: CurrentUser):
    return MessageResponse(message="Logged out successfully")


@router.get("/force_reset", summary="Force Reset Passwords (Debug)")
async def force_reset(db: DbSession):
    try:
        from app.core.security import get_password_hash
        users_to_update = {
            "admin@hitu.edu": "Admin@1234",
            "doctor@hitu.edu": "Doctor@1234",
            "assistant@hitu.edu": "Assist@1234",
            "student@hitu.edu": "Student@1234"
        }
        updated = []
        for email, pwd in users_to_update.items():
            user = await db.execute(
                __import__("sqlalchemy").select(User).where(User.email == email)
            )
            u = user.scalar_one_or_none()
            if u:
                u.hashed_password = get_password_hash(pwd)
                updated.append(email)
        await db.commit()
        return {"status": "success", "updated": updated, "message": "Passwords have been reset! Try logging in now."}
    except Exception as e:
        import traceback
        return {"status": "error", "error": str(e), "trace": traceback.format_exc()}

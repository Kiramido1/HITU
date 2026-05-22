"""
Authentication API tests.
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


class TestAuthentication:
    """Test authentication endpoints."""

    async def test_register_user(self, client: AsyncClient):
        """Test user registration."""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "newuser@hitu.edu",
                "full_name": "New User",
                "password": "SecurePass123!",
                "role": "student"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert "user" in data
        assert data["user"]["email"] == "newuser@hitu.edu"

    async def test_register_duplicate_email(self, client: AsyncClient, admin_user):
        """Test registration with duplicate email fails."""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": admin_user.email,
                "full_name": "Duplicate User",
                "password": "SecurePass123!",
                "role": "student"
            }
        )
        assert response.status_code in [400, 409]

    async def test_login_success(self, client: AsyncClient, admin_user, test_password):
        """Test successful login."""
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": admin_user.email,
                "password": test_password
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["user"]["email"] == admin_user.email

    async def test_login_invalid_email(self, client: AsyncClient):
        """Test login with invalid email."""
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "nonexistent@hitu.edu",
                "password": "TestPassword123!"
            }
        )
        assert response.status_code == 401

    async def test_login_invalid_password(self, client: AsyncClient, admin_user):
        """Test login with invalid password."""
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": admin_user.email,
                "password": "WrongPassword123!"
            }
        )
        assert response.status_code == 401

    async def test_login_inactive_user(self, client: AsyncSession, db_session):
        """Test login with inactive user fails."""
        from app.models.user import User, UserRole
        from uuid import uuid4

        user = User(
            id=uuid4(),
            email="inactive@hitu.edu",
            full_name="Inactive User",
            hashed_password=hash_password("TestPassword123!"),
            role=UserRole.student,
            is_active=False
        )
        db_session.add(user)
        await db_session.commit()

        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "inactive@hitu.edu",
                "password": "TestPassword123!"
            }
        )
        assert response.status_code == 403

    async def test_refresh_token(self, client: AsyncClient, admin_refresh_token):
        """Test token refresh."""
        response = await client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": admin_refresh_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data

    async def test_refresh_invalid_token(self, client: AsyncClient):
        """Test refresh with invalid token."""
        response = await client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": "invalid_token"}
        )
        assert response.status_code == 401

    async def test_get_current_user(self, client: AsyncClient, auth_headers):
        """Test getting current user profile."""
        response = await client.get(
            "/api/v1/auth/me",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "email" in data
        assert "full_name" in data

    async def test_get_current_user_unauthorized(self, client: AsyncClient):
        """Test getting current user without token fails."""
        response = await client.get("/api/v1/auth/me")
        assert response.status_code == 401

    async def test_logout(self, client: AsyncClient, auth_headers):
        """Test logout endpoint."""
        response = await client.post(
            "/api/v1/auth/logout",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data

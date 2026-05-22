"""
User management API tests.
"""
import pytest
from httpx import AsyncClient
from uuid import uuid4


class TestUserManagement:
    """Test user management endpoints."""

    async def test_list_users_as_admin(self, client: AsyncClient, auth_headers):
        """Test listing users as admin."""
        response = await client.get(
            "/api/v1/users/",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data

    async def test_list_users_unauthorized(self, client: AsyncClient, student_auth_headers):
        """Test listing users as student fails."""
        response = await client.get(
            "/api/v1/users/",
            headers=student_auth_headers
        )
        assert response.status_code == 403

    async def test_search_users(self, client: AsyncClient, auth_headers, admin_user):
        """Test searching users."""
        response = await client.get(
            f"/api/v1/users/search?q={admin_user.email[:5]}",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_get_user_by_id(self, client: AsyncClient, auth_headers, admin_user):
        """Test getting user by ID."""
        response = await client.get(
            f"/api/v1/users/{admin_user.id}",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(admin_user.id)

    async def test_get_user_not_found(self, client: AsyncClient, auth_headers):
        """Test getting non-existent user."""
        response = await client.get(
            f"/api/v1/users/{uuid4()}",
            headers=auth_headers
        )
        assert response.status_code == 404

    async def test_update_my_profile(self, client: AsyncClient, student_auth_headers):
        """Test updating own profile."""
        response = await client.put(
            "/api/v1/users/me",
            headers=student_auth_headers,
            json={"full_name": "Updated Name"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["full_name"] == "Updated Name"

    async def test_update_user_as_admin(self, client: AsyncClient, auth_headers, student_user):
        """Test updating user as admin."""
        response = await client.put(
            f"/api/v1/users/{student_user.id}",
            headers=auth_headers,
            json={"full_name": "Admin Updated Name"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["full_name"] == "Admin Updated Name"

    async def test_deactivate_user(self, client: AsyncClient, auth_headers, student_user):
        """Test deactivating a user."""
        response = await client.delete(
            f"/api/v1/users/{student_user.id}",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data

    async def test_deactivate_user_unauthorized(self, client: AsyncClient, doctor_auth_headers, student_user):
        """Test deactivating user as doctor fails."""
        response = await client.delete(
            f"/api/v1/users/{student_user.id}",
            headers=doctor_auth_headers
        )
        assert response.status_code == 403

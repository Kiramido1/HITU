"""
LMS API tests.
"""
import pytest
from httpx import AsyncClient
from uuid import uuid4


class TestMaterials:
    """Test material endpoints."""

    async def test_list_materials(self, client: AsyncClient, auth_headers, test_course):
        """Test listing materials."""
        response = await client.get(
            f"/api/v1/lms/courses/{test_course.id}/materials",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestAssignments:
    """Test assignment endpoints."""

    async def test_list_assignments(self, client: AsyncClient, auth_headers, test_course):
        """Test listing assignments."""
        response = await client.get(
            f"/api/v1/lms/courses/{test_course.id}/assignments",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestNotifications:
    """Test notification endpoints."""

    async def test_get_notifications(self, client: AsyncClient, auth_headers):
        """Test getting notifications."""
        response = await client.get(
            "/api/v1/lms/notifications",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_mark_all_read(self, client: AsyncClient, auth_headers):
        """Test marking all notifications as read."""
        response = await client.put(
            "/api/v1/lms/notifications/read-all",
            headers=auth_headers
        )
        assert response.status_code == 200

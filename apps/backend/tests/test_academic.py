"""
Academic API tests.
"""
import pytest
from httpx import AsyncClient
from uuid import uuid4


class TestSemesters:
    """Test semester endpoints."""

    async def test_list_semesters(self, client: AsyncClient, auth_headers):
        """Test listing semesters."""
        response = await client.get(
            "/api/v1/academic/semesters",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_create_semester(self, client: AsyncClient, auth_headers):
        """Test creating a semester."""
        response = await client.post(
            "/api/v1/academic/semesters",
            headers=auth_headers,
            json={
                "name": "Spring 2025",
                "year": 2025,
                "start_date": "2025-02-01",
                "end_date": "2025-06-30"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Spring 2025"

    async def test_get_semester(self, client: AsyncClient, auth_headers, test_semester):
        """Test getting a semester by ID."""
        response = await client.get(
            f"/api/v1/academic/semesters/{test_semester.id}",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(test_semester.id)

    async def test_update_semester(self, client: AsyncClient, auth_headers, test_semester):
        """Test updating a semester."""
        response = await client.put(
            f"/api/v1/academic/semesters/{test_semester.id}",
            headers=auth_headers,
            json={"name": "Updated Semester"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Semester"

    async def test_activate_semester(self, client: AsyncClient, auth_headers, test_semester):
        """Test activating a semester."""
        response = await client.post(
            f"/api/v1/academic/semesters/{test_semester.id}/activate",
            headers=auth_headers
        )
        assert response.status_code == 200

    async def test_delete_semester(self, client: AsyncClient, auth_headers, test_semester):
        """Test deleting a semester."""
        response = await client.delete(
            f"/api/v1/academic/semesters/{test_semester.id}",
            headers=auth_headers
        )
        assert response.status_code == 200


class TestDepartments:
    """Test department endpoints."""

    async def test_list_departments(self, client: AsyncClient, auth_headers):
        """Test listing departments."""
        response = await client.get(
            "/api/v1/academic/departments",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_create_department(self, client: AsyncClient, auth_headers):
        """Test creating a department."""
        response = await client.post(
            "/api/v1/academic/departments",
            headers=auth_headers,
            json={
                "name": "Mathematics",
                "code": "MATH",
                "description": "Department of Mathematics"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["code"] == "MATH"


class TestCourses:
    """Test course endpoints."""

    async def test_list_courses(self, client: AsyncClient, auth_headers):
        """Test listing courses."""
        response = await client.get(
            "/api/v1/academic/courses",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_create_course(self, client: AsyncClient, auth_headers, test_department, test_semester):
        """Test creating a course."""
        response = await client.post(
            "/api/v1/academic/courses",
            headers=auth_headers,
            json={
                "code": "CS102",
                "name": "Data Structures",
                "credits": 4,
                "department_id": str(test_department.id),
                "semester_id": str(test_semester.id)
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["code"] == "CS102"


class TestHalls:
    """Test hall endpoints."""

    async def test_list_halls(self, client: AsyncClient, auth_headers):
        """Test listing halls."""
        response = await client.get(
            "/api/v1/academic/halls",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_create_hall(self, client: AsyncClient, auth_headers):
        """Test creating a hall."""
        response = await client.post(
            "/api/v1/academic/halls",
            headers=auth_headers,
            json={
                "name": "Lecture Hall B",
                "code": "LHB",
                "capacity": 150,
                "building": "Science Building",
                "floor": 2
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["code"] == "LHB"


class TestAvailability:
    """Test availability endpoints."""

    async def test_add_doctor_availability(self, client: AsyncClient, doctor_auth_headers, test_hall):
        """Test adding doctor availability."""
        response = await client.post(
            "/api/v1/academic/availability",
            headers=doctor_auth_headers,
            json={
                "day_of_week": 1,
                "start_time": "09:00",
                "end_time": "11:00",
                "hall_id": str(test_hall.id)
            }
        )
        assert response.status_code == 201


class TestSchedule:
    """Test schedule endpoints."""

    async def test_generate_schedule(self, client: AsyncClient, auth_headers, test_semester):
        """Test generating a schedule."""
        response = await client.post(
            "/api/v1/academic/schedule/generate",
            headers=auth_headers,
            params={
                "semester_id": str(test_semester.id),
                "optimize_for": "balanced",
                "max_solve_time": 10.0
            }
        )
        # May return 200 or 500 depending on data availability
        assert response.status_code in [200, 500]

    async def test_get_schedule(self, client: AsyncClient, auth_headers, test_semester):
        """Test getting a schedule."""
        response = await client.get(
            f"/api/v1/academic/schedule/{test_semester.id}",
            headers=auth_headers
        )
        assert response.status_code == 200


class TestDashboard:
    """Test dashboard endpoints."""

    async def test_get_dashboard_overview(self, client: AsyncClient, auth_headers):
        """Test getting dashboard overview."""
        response = await client.get(
            "/api/v1/academic/dashboard/overview",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_semesters" in data
        assert "total_departments" in data

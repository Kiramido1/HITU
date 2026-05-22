"""
Pytest configuration and fixtures for HITU AI Platform backend testing.
"""
import asyncio
import os
from typing import AsyncGenerator, Generator
from uuid import uuid4

import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.core.security import create_access_token, create_refresh_token, hash_password
from main import app
from app.models.base import Base
from app.models.user import User, UserRole
from app.models.academic import Semester, SemesterStatus, Department, Course, Hall

# Test database URL
TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/hitu_test"
)

# Create async engine for testing
engine = create_async_engine(TEST_DATABASE_URL, echo=False)
async_session_maker = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Create a fresh database session for each test."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_maker() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create async test client with database dependency override."""
    from app.core.dependencies import get_db

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
def test_password() -> str:
    """Return test password."""
    return "TestPassword123!"


@pytest.fixture
def hashed_test_password(test_password: str) -> str:
    """Return hashed test password."""
    return hash_password(test_password)


@pytest_asyncio.fixture
async def admin_user(db_session: AsyncSession, hashed_test_password: str) -> User:
    """Create admin user for testing."""
    user = User(
        id=uuid4(),
        email="admin@hitu.edu",
        full_name="Admin User",
        hashed_password=hashed_test_password,
        role=UserRole.admin,
        is_active=True
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def doctor_user(db_session: AsyncSession, hashed_test_password: str) -> User:
    """Create doctor user for testing."""
    user = User(
        id=uuid4(),
        email="doctor@hitu.edu",
        full_name="Dr. John Doe",
        hashed_password=hashed_test_password,
        role=UserRole.doctor,
        is_active=True
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def assistant_user(db_session: AsyncSession, hashed_test_password: str) -> User:
    """Create assistant user for testing."""
    user = User(
        id=uuid4(),
        email="assistant@hitu.edu",
        full_name="Jane Smith",
        hashed_password=hashed_test_password,
        role=UserRole.assistant,
        is_active=True
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def student_user(db_session: AsyncSession, hashed_test_password: str) -> User:
    """Create student user for testing."""
    user = User(
        id=uuid4(),
        email="student@hitu.edu",
        full_name="Student User",
        hashed_password=hashed_test_password,
        role=UserRole.student,
        is_active=True
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
def admin_token(admin_user: User) -> str:
    """Return JWT token for admin user."""
    return create_access_token({"sub": str(admin_user.id)})


@pytest.fixture
def admin_refresh_token(admin_user: User) -> str:
    """Return refresh token for admin user."""
    return create_refresh_token({"sub": str(admin_user.id)})


@pytest.fixture
def doctor_token(doctor_user: User) -> str:
    """Return JWT token for doctor user."""
    return create_access_token({"sub": str(doctor_user.id)})


@pytest.fixture
def student_token(student_user: User) -> str:
    """Return JWT token for student user."""
    return create_access_token({"sub": str(student_user.id)})


@pytest_asyncio.fixture
async def test_semester(db_session: AsyncSession) -> Semester:
    """Create test semester."""
    semester = Semester(
        id=uuid4(),
        name="Fall 2024",
        year=2024,
        status=SemesterStatus.active,
        start_date="2024-09-01",
        end_date="2025-01-15"
    )
    db_session.add(semester)
    await db_session.commit()
    await db_session.refresh(semester)
    return semester


@pytest_asyncio.fixture
async def test_department(db_session: AsyncSession) -> Department:
    """Create test department."""
    department = Department(
        id=uuid4(),
        name="Computer Science",
        code="CS",
        description="Department of Computer Science"
    )
    db_session.add(department)
    await db_session.commit()
    await db_session.refresh(department)
    return department


@pytest_asyncio.fixture
async def test_course(db_session: AsyncSession, test_department: Department, test_semester: Semester) -> Course:
    """Create test course."""
    course = Course(
        id=uuid4(),
        code="CS101",
        name="Introduction to Programming",
        credits=3,
        department_id=test_department.id,
        semester_id=test_semester.id
    )
    db_session.add(course)
    await db_session.commit()
    await db_session.refresh(course)
    return course


@pytest_asyncio.fixture
async def test_hall(db_session: AsyncSession) -> Hall:
    """Create test hall."""
    hall = Hall(
        id=uuid4(),
        name="Lecture Hall A",
        code="LHA",
        capacity=100,
        building="Main Building",
        floor=1
    )
    db_session.add(hall)
    await db_session.commit()
    await db_session.refresh(hall)
    return hall


@pytest.fixture
def auth_headers(admin_token: str) -> dict:
    """Return authorization headers with admin token."""
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def doctor_auth_headers(doctor_token: str) -> dict:
    """Return authorization headers with doctor token."""
    return {"Authorization": f"Bearer {doctor_token}"}


@pytest.fixture
def student_auth_headers(student_token: str) -> dict:
    """Return authorization headers with student token."""
    return {"Authorization": f"Bearer {student_token}"}

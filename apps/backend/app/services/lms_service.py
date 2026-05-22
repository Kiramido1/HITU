"""LMS service — material uploads, assignments, submissions."""
from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lms import Assignment, Material, Submission
from app.models.user import User, UserRole
from app.repositories.academic import CourseRepository, SemesterRepository
from app.repositories.lms import AssignmentRepository, MaterialRepository, SubmissionRepository
from app.repositories.user import UserRepository
from app.schemas.lms import AssignmentCreate, AssignmentUpdate, MaterialCreate, SubmissionCreate, GradeSubmission
from app.utils.file_upload import delete_file


class LMSService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.mat_repo = MaterialRepository(db)
        self.ass_repo = AssignmentRepository(db)
        self.sub_repo = SubmissionRepository(db)
        self.course_repo = CourseRepository(db)
        self.semester_repo = SemesterRepository(db)
        self.user_repo = UserRepository(db)

    async def get_accessible_courses(self, user: User) -> List:
        """Courses visible to the current user (RBAC + department enrollment)."""
        active = await self.semester_repo.get_active()
        semester_id = active.id if active else None

        if user.role == UserRole.admin:
            if semester_id:
                return await self.course_repo.get_by_semester(semester_id, limit=200)
            return await self.course_repo.get_all()

        if user.role == UserRole.doctor:
            return await self.course_repo.get_by_doctor(user.id)

        if user.role == UserRole.assistant:
            return await self.course_repo.get_by_assistant(user.id)

        if user.role == UserRole.student:
            if not user.department:
                return []
            return await self.course_repo.get_by_department_code(user.department, semester_id)

        return []

    async def ensure_course_access(self, user: User, course_id: UUID) -> None:
        courses = await self.get_accessible_courses(user)
        if user.role != UserRole.admin and not any(c.id == course_id for c in courses):
            raise HTTPException(status.HTTP_403_FORBIDDEN, "You do not have access to this course")

    async def get_my_materials(self, user: User) -> List[Material]:
        materials: List[Material] = []
        for course in await self.get_accessible_courses(user):
            published_only = user.role == UserRole.student
            materials.extend(await self.mat_repo.get_by_course(course.id, published_only=published_only))
        return materials

    async def get_my_assignments(self, user: User) -> List[Assignment]:
        assignments: List[Assignment] = []
        for course in await self.get_accessible_courses(user):
            published_only = user.role == UserRole.student
            assignments.extend(await self.ass_repo.get_by_course(course.id, published_only=published_only))
        return assignments

    async def notify_course_students(self, course_id: UUID, title: str, message: str) -> None:
        from app.schemas.lms import NotificationCreate
        from app.services.notification_service import NotificationService

        course = await self.course_repo.get_with_relations(course_id)
        if not course or not course.department:
            return
        students = await self.user_repo.get_by_role(UserRole.student, skip=0, limit=500)
        notifier = NotificationService(self.db)
        for student in students:
            if student.department and student.department.upper() == course.department.code.upper():
                await notifier.send(NotificationCreate(
                    user_id=student.id,
                    title=title,
                    body=message,
                    notification_type="info",
                ))

    # ── Material ────────────────────────────────────────────────────────────

    async def create_material(
        self, uploader_id: UUID, data: MaterialCreate, file_url: Optional[str] = None, file_size: Optional[int] = None, file_name: Optional[str] = None, mime: Optional[str] = None
    ) -> Material:
        mat_dict = data.model_dump()
        mat_dict.update({
            "uploader_id": uploader_id,
            "file_url": file_url,
            "file_size": file_size,
            "file_name": file_name,
            "mime_type": mime,
        })
        material = await self.mat_repo.create(**mat_dict)
        await self.notify_course_students(
            data.course_id,
            "New course material",
            f"{data.title} was uploaded to your course.",
        )
        return material

    async def delete_material(self, material_id: UUID) -> None:
        mat = await self.mat_repo.get_by_id(material_id)
        if not mat:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Material not found")
        if mat.file_url:
            await delete_file(mat.file_url)
        await self.mat_repo.delete(mat)

    # ── Assignment ──────────────────────────────────────────────────────────

    async def create_assignment(self, creator_id: UUID, data: AssignmentCreate) -> Assignment:
        ass_dict = data.model_dump()
        ass_dict["creator_id"] = creator_id
        assignment = await self.ass_repo.create(**ass_dict)
        await self.notify_course_students(
            data.course_id,
            "New assignment",
            f"{data.title} was posted. Check the deadline in LMS.",
        )
        return assignment

    async def update_assignment(self, ass_id: UUID, data: AssignmentUpdate) -> Assignment:
        ass = await self.ass_repo.get_by_id(ass_id)
        if not ass:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Assignment not found")
        return await self.ass_repo.update(ass, **data.model_dump(exclude_unset=True))

    # ── Submission ──────────────────────────────────────────────────────────

    async def submit_assignment(
        self, student_id: UUID, data: SubmissionCreate, file_url: Optional[str] = None, file_name: Optional[str] = None
    ) -> Submission:
        ass = await self.ass_repo.get_by_id(data.assignment_id)
        if not ass:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Assignment not found")

        student = await self.user_repo.get_by_id(student_id)
        if student:
            await self.ensure_course_access(student, ass.course_id)

        is_late = False
        if ass.deadline:
            if datetime.now(timezone.utc) > ass.deadline:
                if not ass.allow_late:
                    raise HTTPException(status.HTTP_400_BAD_REQUEST, "Deadline passed. Late submissions not allowed.")
                is_late = True

        # Check existing
        existing = await self.sub_repo.get_by_student(student_id, data.assignment_id)
        if existing:
            if existing.file_url and file_url:
                await delete_file(existing.file_url)
            existing.file_url = file_url or existing.file_url
            existing.file_name = file_name or existing.file_name
            existing.text_answer = data.text_answer or existing.text_answer
            existing.submitted_at = datetime.now(timezone.utc)
            existing.is_late = is_late
            return await self.sub_repo.save(existing)

        return await self.sub_repo.create(
            assignment_id=data.assignment_id,
            student_id=student_id,
            file_url=file_url,
            file_name=file_name,
            text_answer=data.text_answer,
            is_late=is_late,
        )

    async def grade_submission(self, grader_id: UUID, sub_id: UUID, data: GradeSubmission) -> Submission:
        sub = await self.sub_repo.get_by_id(sub_id)
        if not sub:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Submission not found")

        ass = await self.ass_repo.get_by_id(sub.assignment_id)
        if data.grade > ass.max_grade:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Grade exceeds maximum ({ass.max_grade})")

        sub.grade = data.grade
        sub.feedback = data.feedback
        sub.grader_id = grader_id
        sub.graded_at = datetime.now(timezone.utc)
        return await self.sub_repo.save(sub)

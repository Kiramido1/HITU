"""
LMS router — Materials, Assignments, Submissions, Notifications.
"""
from typing import List
from uuid import UUID

from fastapi import APIRouter, File, Form, UploadFile, status

from app.core.dependencies import CurrentUser, DbSession, StaffUser
from app.schemas.common import MessageResponse
from app.schemas.lms import (
    AssignmentCreate, AssignmentResponse, MaterialCreate, MaterialResponse,
    SubmissionCreate, SubmissionResponse, GradeSubmission, NotificationResponse
)
from app.services.lms_service import LMSService
from app.services.notification_service import NotificationService
from app.utils.file_upload import save_upload

router = APIRouter(prefix="/lms", tags=["LMS"])

# ── Materials ────────────────────────────────────────────────────────────────

@router.get("/my/courses", summary="List my courses", description="Courses accessible to the authenticated user based on role and department.")
async def list_my_courses(db: DbSession, current_user: CurrentUser):
    courses = await LMSService(db).get_accessible_courses(current_user)
    return [
        {
            "id": str(c.id),
            "code": c.code,
            "name": c.name,
            "department_id": str(c.department_id) if c.department_id else None,
            "semester_id": str(c.semester_id) if c.semester_id else None,
        }
        for c in courses
    ]

@router.get("/my/materials", response_model=List[MaterialResponse], summary="List my materials", description="All published materials for courses the user can access.")
async def list_my_materials(db: DbSession, current_user: CurrentUser):
    return await LMSService(db).get_my_materials(current_user)

@router.get("/my/assignments", response_model=List[AssignmentResponse], summary="List my assignments", description="All assignments for courses the user can access.")
async def list_my_assignments(db: DbSession, current_user: CurrentUser):
    return await LMSService(db).get_my_assignments(current_user)

@router.get("/courses/{course_id}/materials", response_model=List[MaterialResponse], summary="List course materials", description="Retrieve all materials for a specific course. Students only see published materials.")
async def list_materials(course_id: UUID, db: DbSession, current_user: CurrentUser):
    service = LMSService(db)
    await service.ensure_course_access(current_user, course_id)
    published_only = current_user.role == "student"
    return await service.mat_repo.get_by_course(course_id, published_only=published_only)

@router.post("/materials", response_model=MaterialResponse, status_code=status.HTTP_201_CREATED, summary="Upload material", description="Upload a new course material (lecture notes, slides, etc.) with file attachment. Requires staff privileges.")
async def upload_material(
    db: DbSession,
    staff: StaffUser,
    course_id: UUID = Form(...),
    title: str = Form(...),
    description: str = Form(None),
    material_type: str = Form("lecture"),
    week_number: int = Form(None),
    file: UploadFile = File(...),
):
    await LMSService(db).ensure_course_access(staff, course_id)
    file_url, file_name, file_size, mime = await save_upload(file, sub_dir="materials")

    data = MaterialCreate(
        course_id=course_id, title=title, description=description,
        material_type=material_type, week_number=week_number, is_published=True
    )

    return await LMSService(db).create_material(
        staff.id, data, file_url, file_size, file_name, mime
    )

@router.delete("/materials/{material_id}", response_model=MessageResponse, summary="Delete material", description="Delete a course material. Requires staff privileges.")
async def delete_material(material_id: UUID, db: DbSession, staff: StaffUser):
    await LMSService(db).delete_material(material_id)
    return MessageResponse(message="Material deleted")

# ── Assignments ──────────────────────────────────────────────────────────────

@router.get("/courses/{course_id}/assignments", response_model=List[AssignmentResponse], summary="List course assignments", description="Retrieve all assignments for a specific course. Students only see published assignments.")
async def list_assignments(course_id: UUID, db: DbSession, current_user: CurrentUser):
    service = LMSService(db)
    await service.ensure_course_access(current_user, course_id)
    published = current_user.role == "student"
    return await service.ass_repo.get_by_course(course_id, published_only=published)

@router.post("/assignments", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED, summary="Create assignment", description="Create a new assignment for a course. Requires staff privileges.")
async def create_assignment(payload: AssignmentCreate, db: DbSession, staff: StaffUser):
    return await LMSService(db).create_assignment(staff.id, payload)

# ── Submissions ──────────────────────────────────────────────────────────────

@router.post("/submissions", response_model=SubmissionResponse, summary="Submit assignment", description="Submit an assignment with optional text answer and file attachment.")
async def submit_assignment(
    db: DbSession,
    current_user: CurrentUser,
    assignment_id: UUID = Form(...),
    text_answer: str = Form(None),
    file: UploadFile = File(None),
):
    file_url, file_name = None, None
    if file:
        file_url, file_name, _, _ = await save_upload(file, sub_dir="submissions")

    data = SubmissionCreate(assignment_id=assignment_id, text_answer=text_answer)
    return await LMSService(db).submit_assignment(current_user.id, data, file_url, file_name)

@router.put("/submissions/{submission_id}/grade", response_model=SubmissionResponse, summary="Grade submission", description="Grade a student's assignment submission. Requires staff privileges.")
async def grade_submission(submission_id: UUID, payload: GradeSubmission, db: DbSession, staff: StaffUser):
    return await LMSService(db).grade_submission(staff.id, submission_id, payload)

# ── Notifications ────────────────────────────────────────────────────────────

@router.get("/notifications", response_model=List[NotificationResponse], summary="Get notifications", description="Retrieve notifications for the authenticated user. Can filter by unread status.")
async def get_notifications(db: DbSession, current_user: CurrentUser, unread_only: bool = False):
    return await NotificationService(db).get_user_notifications(current_user.id, unread_only)

@router.put("/notifications/read-all", response_model=MessageResponse, summary="Mark all notifications as read", description="Mark all unread notifications for the authenticated user as read.")
async def mark_all_notifications_read(db: DbSession, current_user: CurrentUser):
    count = await NotificationService(db).mark_all_read(current_user.id)
    return MessageResponse(message=f"Marked {count} notifications as read")

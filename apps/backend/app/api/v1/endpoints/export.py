"""Export router — schedule Excel/PDF downloads."""
from uuid import UUID

from fastapi import APIRouter
from fastapi.responses import Response

from app.core.dependencies import CurrentUser, DbSession
from app.repositories.academic import ScheduleRepository, SemesterRepository
from app.services.export_service import ExportService

router = APIRouter(prefix="/export", tags=["Export"])


def _schedule_rows(entries) -> list:
    return [
        {
            "day": e.day_of_week.value if hasattr(e.day_of_week, "value") else str(e.day_of_week),
            "start_time": e.start_time.strftime("%H:%M") if e.start_time else "",
            "end_time": e.end_time.strftime("%H:%M") if e.end_time else "",
            "course_code": e.course.code if e.course else "",
            "course_name": e.course.name if e.course else "",
            "hall": e.hall.name if e.hall else "",
            "entry_type": e.entry_type.value if hasattr(e.entry_type, "value") else str(e.entry_type),
        }
        for e in entries
    ]


@router.get("/schedule/{semester_id}/excel", summary="Export schedule as Excel")
async def export_schedule_excel(semester_id: UUID, db: DbSession, current_user: CurrentUser):
    entries = await ScheduleRepository(db).get_by_semester(semester_id)
    semester = await SemesterRepository(db).get_by_id(semester_id)
    name = semester.name if semester else "Semester"
    content = ExportService().generate_excel_schedule(_schedule_rows(entries), name, "All Departments")
    return Response(
        content=content,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="schedule_{semester_id}.xlsx"'},
    )


@router.get("/schedule/{semester_id}/pdf", summary="Export schedule as PDF")
async def export_schedule_pdf(semester_id: UUID, db: DbSession, current_user: CurrentUser):
    entries = await ScheduleRepository(db).get_by_semester(semester_id)
    semester = await SemesterRepository(db).get_by_id(semester_id)
    name = semester.name if semester else "Semester"
    content = ExportService().generate_pdf_schedule(_schedule_rows(entries), name, "All Departments")
    return Response(
        content=content,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="schedule_{semester_id}.pdf"'},
    )

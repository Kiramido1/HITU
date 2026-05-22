"""
Scheduler router — trigger AI generation and fetch timetable.
"""
from uuid import UUID
from fastapi import APIRouter, Query

from app.core.dependencies import AdminUser, DbSession
from app.services.scheduler import SchedulerService

router = APIRouter(prefix="/scheduler", tags=["AI Engine"])


@router.post("/generate/{semester_id}", summary="Generate AI schedule", description="Trigger the AI timetable generator to create an optimized schedule for a semester using OR-Tools CP-SAT solver. This endpoint is the main entry point for the AI scheduling engine.")
async def generate_schedule(
    semester_id: UUID,
    optimize_for: str = Query("balanced", description="Optimization strategy: balanced, compact, or spread"),
    max_solve_time: float = Query(30.0, description="Maximum solve time in seconds"),
    db: DbSession = None,
    admin: AdminUser = None
):
    service = SchedulerService(db)
    result = await service.generate_schedule(semester_id, optimize_for, max_solve_time)
    return result

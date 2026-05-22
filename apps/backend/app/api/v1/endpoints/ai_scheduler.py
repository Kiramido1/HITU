"""
AI Scheduler router — LLM-enhanced scheduling endpoints.

These endpoints use the local Ollama model to analyze, recommend,
explain, and enhance the OR-Tools schedule generation.
"""
from uuid import UUID

from fastapi import APIRouter, Query

from app.ai.ollama_client import OllamaClient
from app.ai.scheduling_assistant import SchedulingAssistant
from app.core.dependencies import AdminUser, DbSession
from app.services.scheduler import SchedulerService

router = APIRouter(prefix="/ai", tags=["AI Engine"])


@router.get("/health", summary="Check AI engine health")
async def ai_health_check():
    """Check if the Ollama AI engine is reachable and has the configured model."""
    client = OllamaClient()
    is_healthy = await client.is_healthy()
    models = await client.get_models() if is_healthy else []

    return {
        "status": "ok" if is_healthy else "unavailable",
        "ollama_url": client.base_url,
        "configured_model": client.model,
        "model_available": is_healthy,
        "installed_models": [m.get("name", "") for m in models],
    }


@router.post(
    "/analyze/{semester_id}",
    summary="AI pre-analysis of scheduling data",
    description=(
        "Uses the local AI model to analyze semester data, "
        "detect potential issues, and provide recommendations before "
        "running the OR-Tools scheduler."
    ),
)
async def ai_analyze(
    semester_id: UUID,
    db: DbSession = None,
    admin: AdminUser = None,
):
    """Run AI analysis on semester scheduling data."""
    assistant = SchedulingAssistant(db)
    result = await assistant.analyze_constraints(semester_id)
    return result


@router.post(
    "/recommend/{semester_id}",
    summary="AI strategy recommendation",
    description=(
        "Uses the local AI model to analyze the semester data "
        "and recommend the best OR-Tools optimization strategy."
    ),
)
async def ai_recommend_strategy(
    semester_id: UUID,
    db: DbSession = None,
    admin: AdminUser = None,
):
    """Get AI recommendation for optimization strategy."""
    assistant = SchedulingAssistant(db)
    result = await assistant.recommend_strategy(semester_id)
    return result


@router.post(
    "/generate/{semester_id}",
    summary="AI-enhanced schedule generation",
    description=(
        "Full AI-enhanced workflow: analyze constraints, recommend strategy, "
        "generate schedule with OR-Tools, then explain the results. "
        "Falls back to standard OR-Tools if AI is unavailable."
    ),
)
async def ai_generate_schedule(
    semester_id: UUID,
    use_ai_strategy: bool = Query(
        True,
        description="Let AI choose the optimization strategy"
    ),
    max_solve_time: float = Query(
        30.0,
        description="Maximum solve time in seconds (AI may override)"
    ),
    db: DbSession = None,
    admin: AdminUser = None,
):
    """Generate schedule with AI-enhanced workflow."""
    assistant = SchedulingAssistant(db)
    scheduler = SchedulerService(db)

    result = {
        "ai_analysis": None,
        "ai_strategy": None,
        "schedule_result": None,
        "ai_explanation": None,
        "ai_diagnosis": None,
    }

    # Step 1: AI pre-analysis (non-blocking — continues even if AI fails)
    analysis = await assistant.analyze_constraints(semester_id)
    result["ai_analysis"] = analysis

    # Step 2: Determine strategy
    optimize_for = "balanced"
    solve_time = max_solve_time

    if use_ai_strategy:
        recommendation = await assistant.recommend_strategy(semester_id)
        result["ai_strategy"] = recommendation
        if recommendation.get("success"):
            optimize_for = recommendation["strategy"]
            solve_time = recommendation.get("max_solve_time", max_solve_time)

    # Step 3: Run OR-Tools scheduler
    schedule_result = await scheduler.generate_schedule(
        semester_id,
        optimize_for=optimize_for,
        max_solve_time=solve_time,
    )
    result["schedule_result"] = schedule_result

    # Step 4: Post-generation AI response
    if schedule_result.get("success"):
        # Explain the generated schedule
        explanation = await assistant.explain_schedule(semester_id)
        result["ai_explanation"] = explanation
    else:
        # Diagnose infeasibility
        diagnosis = await assistant.diagnose_infeasibility(
            semester_id, schedule_result
        )
        result["ai_diagnosis"] = diagnosis

    return result


@router.post(
    "/explain/{semester_id}",
    summary="AI schedule explanation",
    description=(
        "Generate a human-readable explanation of the existing schedule "
        "for a semester. Useful for administrators reviewing generated timetables."
    ),
)
async def ai_explain_schedule(
    semester_id: UUID,
    db: DbSession = None,
    admin: AdminUser = None,
):
    """Get AI explanation of existing schedule."""
    assistant = SchedulingAssistant(db)
    result = await assistant.explain_schedule(semester_id)
    return result


@router.post(
    "/diagnose/{semester_id}",
    summary="AI infeasibility diagnosis",
    description=(
        "When a schedule generation fails, use AI to diagnose "
        "the cause and suggest specific fixes."
    ),
)
async def ai_diagnose(
    semester_id: UUID,
    db: DbSession = None,
    admin: AdminUser = None,
):
    """Diagnose scheduling failures with AI."""
    assistant = SchedulingAssistant(db)

    # Create a mock solver result for diagnosis
    solver_result = {
        "success": False,
        "status": "INFEASIBLE",
        "message": "Admin requested diagnosis of scheduling constraints",
    }

    result = await assistant.diagnose_infeasibility(semester_id, solver_result)
    return result

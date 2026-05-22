"""
AI Scheduling Assistant for HITU Platform.

Uses the local Ollama LLM to provide intelligent analysis, recommendations,
and explanations for the OR-Tools CP-SAT schedule generator.

The AI does NOT replace OR-Tools — it acts as a smart orchestrator that:
  1. Pre-analyzes data quality before solving
  2. Recommends optimal solver parameters
  3. Explains generated schedules in natural language
  4. Diagnoses infeasibility and suggests fixes
"""
import json
import logging
from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.ai.ollama_client import OllamaClient, OllamaError
from app.models.academic import (
    AssistantAvailability,
    Course,
    CourseAssignment,
    Department,
    DoctorAvailability,
    Hall,
    HallAvailability,
    ScheduleSlot,
    Semester,
)

logger = logging.getLogger(__name__)

# System prompt that defines the AI's role
SYSTEM_PROMPT = """You are HITU AI, a university scheduling assistant. Your role is to:
1. Analyze academic scheduling data (courses, halls, doctors, assistants, availability)
2. Identify potential scheduling conflicts and data quality issues
3. Recommend optimization strategies for the OR-Tools CP-SAT solver
4. Explain generated schedules in clear, actionable language
5. Diagnose why schedules might be infeasible and suggest fixes

You work with Egyptian university data. Days are Saturday through Thursday.
Time slots are: 08:00-10:00, 10:00-12:00, 12:30-14:30, 14:30-16:30, 16:30-18:30.

Always respond in a structured, professional format. Use bullet points and clear headings.
When analyzing data, be specific about numbers and percentages.
When suggesting fixes, be actionable and prioritize by impact."""


class SchedulingAssistant:
    """AI-powered scheduling assistant that enhances OR-Tools with LLM intelligence."""

    def __init__(self, db: AsyncSession, ollama: Optional[OllamaClient] = None):
        self.db = db
        self.ollama = ollama or OllamaClient()

    # ── Data Collection ─────────────────────────────────────────────────

    async def _collect_semester_data(self, semester_id: UUID) -> Dict[str, Any]:
        """Gather all scheduling-relevant data for a semester."""

        # Semester info
        semester = await self.db.execute(
            select(Semester).where(Semester.id == semester_id)
        )
        semester = semester.scalar_one_or_none()
        if not semester:
            raise ValueError(f"Semester {semester_id} not found")

        # Departments
        departments = await self.db.execute(
            select(Department).where(Department.semester_id == semester_id)
        )
        departments = list(departments.scalars().all())

        # Courses with relations
        courses = await self.db.execute(
            select(Course)
            .where(Course.semester_id == semester_id, Course.is_active.is_(True))
            .options(
                selectinload(Course.doctor),
                selectinload(Course.department),
                selectinload(Course.course_assistants),
            )
        )
        courses = list(courses.scalars().all())

        # Halls
        halls = await self.db.execute(
            select(Hall).where(Hall.is_active.is_(True))
        )
        halls = list(halls.scalars().all())

        # Hall availability
        hall_ids = [h.id for h in halls]
        hall_avail = await self.db.execute(
            select(HallAvailability).where(
                HallAvailability.hall_id.in_(hall_ids)
            )
        )
        hall_avail = list(hall_avail.scalars().all())

        # Doctor availability
        doctor_ids = list({c.doctor_id for c in courses if c.doctor_id})
        doc_avail = []
        if doctor_ids:
            doc_avail_result = await self.db.execute(
                select(DoctorAvailability).where(
                    DoctorAvailability.user_id.in_(doctor_ids)
                )
            )
            doc_avail = list(doc_avail_result.scalars().all())

        # Assistant availability
        assistant_ids = []
        for c in courses:
            for ca in c.course_assistants:
                assistant_ids.append(ca.staff_id)
        assistant_ids = list(set(assistant_ids))

        asst_avail = []
        if assistant_ids:
            asst_avail_result = await self.db.execute(
                select(AssistantAvailability).where(
                    AssistantAvailability.user_id.in_(assistant_ids)
                )
            )
            asst_avail = list(asst_avail_result.scalars().all())

        # Existing schedule
        existing_schedule = await self.db.execute(
            select(ScheduleSlot).where(
                ScheduleSlot.semester_id == semester_id
            )
        )
        existing_schedule = list(existing_schedule.scalars().all())

        return {
            "semester": semester,
            "departments": departments,
            "courses": courses,
            "halls": halls,
            "hall_availability": hall_avail,
            "doctor_availability": doc_avail,
            "assistant_availability": asst_avail,
            "existing_schedule": existing_schedule,
        }

    def _summarize_data(self, data: Dict[str, Any]) -> str:
        """Convert collected data into a concise text summary for the LLM."""
        semester = data["semester"]
        courses = data["courses"]
        halls = data["halls"]
        departments = data["departments"]
        doc_avail = data["doctor_availability"]
        asst_avail = data["assistant_availability"]
        hall_avail = data["hall_availability"]
        existing = data["existing_schedule"]

        # Compute key metrics
        total_lectures = sum(c.lecture_count for c in courses)
        total_sections = sum(c.section_count for c in courses)
        total_students = sum(c.student_count for c in courses)
        total_hall_capacity = sum(h.capacity for h in halls)
        lecture_halls = [h for h in halls if h.hall_type.value in ("lecture", "amphitheater")]
        lab_halls = [h for h in halls if h.hall_type.value in ("lab", "seminar")]

        # Doctor workload
        doctor_courses: Dict[str, int] = {}
        for c in courses:
            if c.doctor_id:
                doc_key = str(c.doctor_id)
                doctor_courses[doc_key] = doctor_courses.get(doc_key, 0) + c.lecture_count

        # Courses without doctors
        no_doctor = [c for c in courses if not c.doctor_id]

        # Courses without assistants
        no_assistant = [c for c in courses if not c.course_assistants and c.section_count > 0]

        # Blocked slots
        blocked_doc = [a for a in doc_avail if a.is_blocked]
        blocked_hall = [a for a in hall_avail if a.is_blocked]

        # Capacity issues
        capacity_issues = []
        max_lecture_cap = max((h.capacity for h in lecture_halls), default=0)
        for c in courses:
            if c.student_count > max_lecture_cap:
                capacity_issues.append(
                    f"- {c.code} ({c.name}): {c.student_count} students, "
                    f"max hall capacity: {max_lecture_cap}"
                )

        # Time slots available
        days = 6  # Saturday-Thursday
        slots_per_day = 5
        total_slots = days * slots_per_day
        total_hall_slots = total_slots * len(lecture_halls)

        summary = f"""=== SEMESTER DATA SUMMARY ===
Semester: {semester.name} ({semester.academic_year})
Status: {semester.status.value}

--- DEPARTMENTS ---
Count: {len(departments)}
{chr(10).join(f"- {d.name} (code: {d.code}, students: {d.student_count})" for d in departments)}

--- COURSES ---
Total courses: {len(courses)}
Total lecture slots needed: {total_lectures}
Total section slots needed: {total_sections}
Total students: {total_students}
Courses without assigned doctor: {len(no_doctor)}
{chr(10).join(f"  - {c.code}: {c.name}" for c in no_doctor[:5])}
Courses without assigned assistant (but need sections): {len(no_assistant)}
{chr(10).join(f"  - {c.code}: {c.name} ({c.section_count} sections)" for c in no_assistant[:5])}

--- HALLS ---
Total halls: {len(halls)}
Lecture halls: {len(lecture_halls)} (capacities: {', '.join(str(h.capacity) for h in sorted(lecture_halls, key=lambda h: h.capacity, reverse=True)[:10])})
Lab/seminar halls: {len(lab_halls)}
Total lecture-hall time slots: {total_hall_slots}
Lectures needing scheduling: {total_lectures}
Slot utilization rate: {round(total_lectures / total_hall_slots * 100, 1) if total_hall_slots > 0 else 'N/A'}%

--- CAPACITY ISSUES ---
{chr(10).join(capacity_issues) if capacity_issues else "None detected"}

--- DOCTOR AVAILABILITY ---
Unique doctors: {len(doctor_courses)}
Blocked doctor slots: {len(blocked_doc)}
Doctor workload (lectures): {json.dumps({k: v for k, v in sorted(doctor_courses.items(), key=lambda x: x[1], reverse=True)[:10]})}

--- HALL BLOCKED SLOTS ---
Blocked hall slots: {len(blocked_hall)}

--- EXISTING SCHEDULE ---
Existing entries: {len(existing)}
AI-generated entries: {len([e for e in existing if e.ai_generated])}
"""
        return summary

    # ── AI Analysis Methods ─────────────────────────────────────────────

    async def analyze_constraints(self, semester_id: UUID) -> Dict[str, Any]:
        """
        Pre-analyze semester data and flag potential scheduling issues.

        Returns a structured report with warnings, errors, and recommendations.
        """
        data = await self._collect_semester_data(semester_id)
        summary = self._summarize_data(data)

        prompt = f"""Analyze the following university semester scheduling data and provide a detailed report.

{summary}

Please provide your analysis in the following structure:
1. DATA QUALITY: List any missing or problematic data
2. FEASIBILITY CHECK: Can all courses be scheduled? Are there enough halls/slots?
3. POTENTIAL CONFLICTS: What scheduling conflicts might arise?
4. WARNINGS: Any issues that won't block scheduling but should be addressed
5. RECOMMENDATIONS: Specific actions to take before generating the schedule

Be specific with numbers and course codes. Focus on actionable insights."""

        try:
            response = await self.ollama.generate(
                prompt,
                system=SYSTEM_PROMPT,
                temperature=0.2,
                max_tokens=3000,
            )

            return {
                "success": True,
                "semester_id": str(semester_id),
                "semester_name": data["semester"].name,
                "analysis": response,
                "metrics": {
                    "total_courses": len(data["courses"]),
                    "total_halls": len(data["halls"]),
                    "total_lectures_needed": sum(
                        c.lecture_count for c in data["courses"]
                    ),
                    "total_sections_needed": sum(
                        c.section_count for c in data["courses"]
                    ),
                    "courses_without_doctor": len(
                        [c for c in data["courses"] if not c.doctor_id]
                    ),
                    "courses_without_assistant": len(
                        [
                            c
                            for c in data["courses"]
                            if not c.course_assistants and c.section_count > 0
                        ]
                    ),
                    "unique_doctors": len(
                        {c.doctor_id for c in data["courses"] if c.doctor_id}
                    ),
                },
            }
        except OllamaError as exc:
            logger.error("AI analysis failed: %s", exc)
            return {
                "success": False,
                "error": str(exc),
                "fallback": "AI analysis unavailable. Proceeding with OR-Tools defaults.",
            }

    async def recommend_strategy(self, semester_id: UUID) -> Dict[str, Any]:
        """
        Recommend the best OR-Tools optimization strategy based on data analysis.

        Returns one of: 'balanced', 'compact', 'spread' with reasoning.
        """
        data = await self._collect_semester_data(semester_id)
        summary = self._summarize_data(data)

        prompt = f"""Based on this university scheduling data, recommend the best optimization strategy.

{summary}

Available strategies:
- "balanced": Spreads courses evenly across days and time slots. Good default.
- "compact": Minimizes gaps, packs courses into fewer days. Good when students want fewer campus days.
- "spread": Maximizes distribution across days. Good when hall utilization is tight.

Consider:
1. Hall utilization rate — if slots are tight, "spread" helps avoid conflicts
2. Student count per department — if many students, "compact" reduces their campus days
3. Doctor workload — if doctors are overloaded, "balanced" distributes their load

Respond with ONLY a JSON object:
{{"strategy": "balanced|compact|spread", "reason": "brief explanation", "max_solve_time": 15-60, "confidence": 0.0-1.0}}"""

        try:
            response = await self.ollama.generate(
                prompt,
                system=SYSTEM_PROMPT,
                temperature=0.1,
                max_tokens=500,
            )

            # Try to parse JSON from the response
            try:
                # Extract JSON from response (handle markdown code blocks)
                json_str = response.strip()
                if "```" in json_str:
                    json_str = json_str.split("```")[1]
                    if json_str.startswith("json"):
                        json_str = json_str[4:]
                    json_str = json_str.strip()

                recommendation = json.loads(json_str)
                strategy = recommendation.get("strategy", "balanced")
                if strategy not in ("balanced", "compact", "spread"):
                    strategy = "balanced"

                return {
                    "success": True,
                    "strategy": strategy,
                    "reason": recommendation.get("reason", "AI recommendation"),
                    "max_solve_time": min(
                        max(recommendation.get("max_solve_time", 30), 10), 120
                    ),
                    "confidence": recommendation.get("confidence", 0.5),
                }
            except (json.JSONDecodeError, IndexError):
                # Fallback: extract strategy keyword from text
                response_lower = response.lower()
                if "compact" in response_lower:
                    strategy = "compact"
                elif "spread" in response_lower:
                    strategy = "spread"
                else:
                    strategy = "balanced"

                return {
                    "success": True,
                    "strategy": strategy,
                    "reason": response[:200],
                    "max_solve_time": 30,
                    "confidence": 0.3,
                }
        except OllamaError as exc:
            logger.error("AI strategy recommendation failed: %s", exc)
            return {
                "success": False,
                "strategy": "balanced",
                "reason": "AI unavailable, using default strategy",
                "max_solve_time": 30,
                "confidence": 0.0,
            }

    async def explain_schedule(self, semester_id: UUID) -> Dict[str, Any]:
        """
        Generate a human-readable explanation of the current schedule.
        """
        data = await self._collect_semester_data(semester_id)
        existing = data["existing_schedule"]

        if not existing:
            return {
                "success": False,
                "message": "No schedule entries found for this semester.",
            }

        # Build schedule summary
        day_counts: Dict[str, int] = {}
        slot_counts: Dict[str, int] = {}
        hall_usage: Dict[str, int] = {}
        doctor_load: Dict[str, int] = {}

        for entry in existing:
            day = entry.day_of_week.value
            day_counts[day] = day_counts.get(day, 0) + 1

            slot_key = f"{entry.start_time}-{entry.end_time}"
            slot_counts[slot_key] = slot_counts.get(slot_key, 0) + 1

            if entry.hall_id:
                hall_key = str(entry.hall_id)
                hall_usage[hall_key] = hall_usage.get(hall_key, 0) + 1

            if entry.doctor_id:
                doc_key = str(entry.doctor_id)
                doctor_load[doc_key] = doctor_load.get(doc_key, 0) + 1

        conflicts = [e for e in existing if e.conflict_flag]
        ai_generated = [e for e in existing if e.ai_generated]

        schedule_summary = f"""=== SCHEDULE OVERVIEW ===
Total entries: {len(existing)}
AI-generated: {len(ai_generated)}
Conflicts detected: {len(conflicts)}

Day distribution: {json.dumps(day_counts, indent=2)}
Time slot distribution: {json.dumps(slot_counts, indent=2)}
Unique halls used: {len(hall_usage)}
Unique doctors scheduled: {len(doctor_load)}

Most loaded day: {max(day_counts, key=day_counts.get) if day_counts else 'N/A'} ({max(day_counts.values()) if day_counts else 0} entries)
Least loaded day: {min(day_counts, key=day_counts.get) if day_counts else 'N/A'} ({min(day_counts.values()) if day_counts else 0} entries)
"""

        prompt = f"""Explain this university schedule to an academic administrator.

{schedule_summary}

Provide:
1. OVERVIEW: Brief summary of the schedule
2. BALANCE ASSESSMENT: How well-distributed is the schedule across days and time slots?
3. UTILIZATION: Are halls and time slots being used efficiently?
4. STUDENT EXPERIENCE: Based on the distribution, how many days per week would students typically need to attend?
5. IMPROVEMENTS: What could be improved in the next generation?

Write clearly and concisely for a university administrator who is not technical."""

        try:
            response = await self.ollama.generate(
                prompt,
                system=SYSTEM_PROMPT,
                temperature=0.3,
                max_tokens=2000,
            )

            return {
                "success": True,
                "semester_id": str(semester_id),
                "explanation": response,
                "stats": {
                    "total_entries": len(existing),
                    "ai_generated": len(ai_generated),
                    "conflicts": len(conflicts),
                    "day_distribution": day_counts,
                    "slot_distribution": slot_counts,
                    "halls_used": len(hall_usage),
                    "doctors_scheduled": len(doctor_load),
                },
            }
        except OllamaError as exc:
            logger.error("AI schedule explanation failed: %s", exc)
            return {
                "success": False,
                "error": str(exc),
            }

    async def diagnose_infeasibility(
        self, semester_id: UUID, solver_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        When OR-Tools returns INFEASIBLE, diagnose why and suggest fixes.
        """
        data = await self._collect_semester_data(semester_id)
        summary = self._summarize_data(data)

        prompt = f"""The OR-Tools CP-SAT solver returned INFEASIBLE for this university schedule.

Solver result: {json.dumps(solver_result, indent=2, default=str)}

Semester data:
{summary}

Diagnose why the schedule is infeasible and suggest specific fixes. Consider:
1. Are there enough hall slots for all lectures?
2. Are any doctors assigned too many courses for their available time?
3. Are there hall capacity issues (courses with more students than any hall)?
4. Are there too many blocked time slots?
5. Are there circular constraints that make scheduling impossible?

For each issue found, suggest a concrete fix (e.g., "Add a hall with capacity >= 200",
"Reduce lecture_count for CS101 from 3 to 2", "Unblock Dr. X on Mondays")."""

        try:
            response = await self.ollama.generate(
                prompt,
                system=SYSTEM_PROMPT,
                temperature=0.2,
                max_tokens=2500,
            )

            return {
                "success": True,
                "semester_id": str(semester_id),
                "diagnosis": response,
                "solver_status": solver_result.get("status", "INFEASIBLE"),
            }
        except OllamaError as exc:
            logger.error("AI infeasibility diagnosis failed: %s", exc)
            return {
                "success": False,
                "error": str(exc),
                "fallback": "AI diagnosis unavailable. Check hall capacity, doctor availability, and time slot constraints manually.",
            }

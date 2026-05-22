"""
AI Scheduling Service — uses Google OR-Tools CP-SAT solver.
Pulls constraints from database to generate conflict-free university timetables.
"""
import time
from typing import Dict, Optional, Tuple
from uuid import UUID
from datetime import time as dtime

from ortools.sat.python import cp_model
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.academic import (
    ScheduleEntry, ScheduleEntryType, DayOfWeek
)
from app.repositories.academic import (
    CourseRepository, DoctorAvailabilityRepository, HallRepository,
    ScheduleRepository, AssistantAvailabilityRepository
)


class SchedulerService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.course_repo = CourseRepository(db)
        self.hall_repo = HallRepository(db)
        self.doc_avail_repo = DoctorAvailabilityRepository(db)
        self.asst_avail_repo = AssistantAvailabilityRepository(db)
        self.sched_repo = ScheduleRepository(db)

    async def generate_schedule(
        self,
        semester_id: UUID,
        optimize_for: str = "balanced",
        max_solve_time: float = 30.0
    ) -> Dict:
        """
        Generate optimized schedule using OR-Tools CP-SAT solver.

        Args:
            semester_id: Target semester
            optimize_for: Optimization strategy ('balanced', 'compact', 'spread')
            max_solve_time: Maximum solver time in seconds

        Returns:
            Dict with generation results and statistics
        """
        start_time = time.time()

        # 1. Fetch data
        courses = await self.course_repo.get_by_semester(semester_id, limit=500)
        halls = await self.hall_repo.get_active()

        if not courses or not halls:
            return {
                "success": False,
                "message": "Missing courses or halls",
                "entries_generated": 0
            }

        # Clean existing AI schedule
        deleted_count = await self.sched_repo.delete_ai_generated(semester_id)

        # 2. Setup OR-Tools Model
        model = cp_model.CpModel()
        vars_dict = {}

        # Time slots (6 days, 5 slots per day)
        days = list(DayOfWeek)
        slots_per_day = 5
        slot_times = [
            (dtime(8, 0), dtime(10, 0)),
            (dtime(10, 0), dtime(12, 0)),
            (dtime(12, 30), dtime(14, 30)),
            (dtime(14, 30), dtime(16, 30)),
            (dtime(16, 30), dtime(18, 30)),
        ]

        # Create boolean variables: x[course_id, hall_id, day_idx, slot_idx]
        for course in courses:
            for hall in halls:
                # Capacity constraint
                if hall.capacity < course.student_count:
                    continue

                for d_idx, _ in enumerate(days):
                    for s_idx in range(slots_per_day):
                        var = model.NewBoolVar(f"x_c{course.id}_h{hall.id}_d{d_idx}_s{s_idx}")
                        vars_dict[(str(course.id), str(hall.id), d_idx, s_idx)] = var

        # Hard Constraint 1: Every course gets exactly `lecture_count` slots
        for course in courses:
            course_vars = [
                vars_dict[k] for k in vars_dict if k[0] == str(course.id)
            ]
            if course_vars:
                if course.lecture_count == 1:
                    model.AddExactlyOne(course_vars)
                else:
                    model.Add(sum(course_vars) == course.lecture_count)

        # Hard Constraint 2: Hall can host at most ONE course per time slot
        for hall in halls:
            for d_idx in range(len(days)):
                for s_idx in range(slots_per_day):
                    hall_slot_vars = [
                        vars_dict[k] for k in vars_dict
                        if k[1] == str(hall.id) and k[2] == d_idx and k[3] == s_idx
                    ]
                    if hall_slot_vars:
                        model.AddAtMostOne(hall_slot_vars)

        # Hard Constraint 3: Doctor can only be in one hall at a time
        doctor_courses = {}
        for c in courses:
            if c.doctor_id:
                doctor_courses.setdefault(str(c.doctor_id), []).append(str(c.id))

        for doc_id, doc_course_ids in doctor_courses.items():
            for d_idx in range(len(days)):
                for s_idx in range(slots_per_day):
                    doc_slot_vars = [
                        vars_dict[k] for k in vars_dict
                        if k[0] in doc_course_ids and k[2] == d_idx and k[3] == s_idx
                    ]
                    if doc_slot_vars:
                        model.AddAtMostOne(doc_slot_vars)

        # Hard Constraint 4: Respect doctor availability
        for doc_id in doctor_courses.keys():
            avail_slots = await self.doc_avail_repo.get_by_doctor(UUID(doc_id))
            for avail in avail_slots:
                day_idx = days.index(avail.day)
                # Convert availability time to slot index
                for s_idx, (slot_start, slot_end) in enumerate(slot_times):
                    # Check if slot falls within blocked time
                    if avail.is_blocked:
                        if slot_start >= avail.start_time and slot_end <= avail.end_time:
                            # Block this slot for this doctor
                            for course_id in doctor_courses[doc_id]:
                                for hall in halls:
                                    key = (course_id, str(hall.id), day_idx, s_idx)
                                    if key in vars_dict:
                                        model.Add(vars_dict[key] == 0)

        # Soft Constraints: Optimization objectives
        objective_terms = []

        if optimize_for == "compact":
            # Minimize gaps - prefer consecutive slots
            for k, var in vars_dict.items():
                course_id, hall_id, d_idx, s_idx = k
                # Prefer earlier slots in the day
                weight = (slots_per_day - s_idx) * 10
                objective_terms.append(var * weight)

        elif optimize_for == "spread":
            # Spread courses across days
            for course in courses:
                course_vars = [
                    (k, vars_dict[k]) for k in vars_dict if k[0] == str(course.id)
                ]
                for (k, var) in course_vars:
                    d_idx = k[2]
                    # Penalize same-day assignments
                    weight = -5 if d_idx > 0 else 0
                    objective_terms.append(var * weight)

        else:  # balanced
            # Balance across days and times
            for k, var in vars_dict.items():
                d_idx = k[2]
                s_idx = k[3]
                # Prefer middle slots, spread across days
                weight = (3 - abs(s_idx - 2)) * 5 + (d_idx % 2) * 2
                objective_terms.append(var * weight)

        model.Maximize(sum(objective_terms))

        # 3. Solve
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = max_solve_time
        solver.parameters.num_search_workers = 8
        status = solver.Solve(model)

        # 4. Save to DB and compute statistics
        saved_count = 0
        conflicts_detected = 0
        schedule_stats = {
            "total_slots": len(days) * slots_per_day * len(halls),
            "used_slots": 0,
            "courses_scheduled": 0,
            "hall_utilization": {},
            "day_distribution": {day.value: 0 for day in days}
        }

        if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            scheduled_courses = set()

            for k, var in vars_dict.items():
                if solver.Value(var):
                    course_id, hall_id, d_idx, s_idx = k
                    c_model = next(c for c in courses if str(c.id) == course_id)

                    # Check for conflicts
                    conflict = await self._check_conflict(
                        semester_id, UUID(course_id), UUID(hall_id),
                        c_model.doctor_id, days[d_idx], slot_times[s_idx]
                    )
                    if conflict:
                        conflicts_detected += 1

                    entry = ScheduleEntry(
                        semester_id=semester_id,
                        course_id=UUID(course_id),
                        hall_id=UUID(hall_id),
                        doctor_id=c_model.doctor_id,
                        entry_type=ScheduleEntryType.lecture,
                        day_of_week=days[d_idx],
                        start_time=slot_times[s_idx][0],
                        end_time=slot_times[s_idx][1],
                        conflict_flag=conflict,
                        ai_generated=True,
                    )
                    self.db.add(entry)
                    saved_count += 1
                    scheduled_courses.add(course_id)

                    # Update statistics
                    schedule_stats["used_slots"] += 1
                    schedule_stats["day_distribution"][days[d_idx].value] += 1
                    if hall_id not in schedule_stats["hall_utilization"]:
                        schedule_stats["hall_utilization"][hall_id] = 0
                    schedule_stats["hall_utilization"][hall_id] += 1

            schedule_stats["courses_scheduled"] = len(scheduled_courses)
            schedule_stats["utilization_rate"] = round(
                (schedule_stats["used_slots"] / schedule_stats["total_slots"]) * 100, 2
            )

            await self.db.commit()

            return {
                "success": True,
                "status": "OPTIMAL" if status == cp_model.OPTIMAL else "FEASIBLE",
                "entries_generated": saved_count,
                "conflicts_detected": conflicts_detected,
                "solve_time_seconds": round(time.time() - start_time, 2),
                "deleted_previous": deleted_count,
                "statistics": schedule_stats,
                "optimization_strategy": optimize_for
            }

        return {
            "success": False,
            "status": "INFEASIBLE",
            "message": "Could not find a feasible schedule",
            "entries_generated": 0,
            "solve_time_seconds": round(time.time() - start_time, 2)
        }

    async def _check_conflict(
        self,
        semester_id: UUID,
        course_id: UUID,
        hall_id: UUID,
        doctor_id: Optional[UUID],
        day: DayOfWeek,
        time_slot: Tuple[dtime, dtime]
    ) -> bool:
        """Check if a schedule entry conflicts with existing entries."""
        existing = await self.db.execute(
            select(ScheduleEntry).where(
                ScheduleEntry.semester_id == semester_id,
                ScheduleEntry.day_of_week == day
            )
        )
        existing_entries = list(existing.scalars().all())

        for entry in existing_entries:
            # Hall conflict
            if entry.hall_id == hall_id:
                if self._time_overlaps(entry.start_time, entry.end_time, time_slot[0], time_slot[1]):
                    return True

            # Doctor conflict
            if doctor_id and entry.doctor_id == doctor_id:
                if self._time_overlaps(entry.start_time, entry.end_time, time_slot[0], time_slot[1]):
                    return True

        return False

    def _time_overlaps(
        self,
        start1: dtime, end1: dtime,
        start2: dtime, end2: dtime
    ) -> bool:
        """Check if two time slots overlap."""
        return not (end1 <= start2 or end2 <= start1)

    async def generate_section_schedule(
        self,
        semester_id: UUID,
        course_id: UUID,
        max_solve_time: float = 15.0
    ) -> Dict:
        """
        Generate section/tutorial schedule for a specific course.
        Uses lab halls and assistant availability.
        """
        start_time = time.time()

        course = await self.course_repo.get_by_id(course_id)
        if not course:
            return {"success": False, "message": "Course not found"}

        # Get lab halls
        lab_halls = await self.hall_repo.get_by_type("lab")
        if not lab_halls:
            return {"success": False, "message": "No lab halls available"}

        # Get course assistants
        from app.models.academic import CourseAssistant
        assistants_result = await self.db.execute(
            select(CourseAssistant).where(CourseAssistant.course_id == course_id)
        )
        assistants = list(assistants_result.scalars().all())

        if not assistants:
            return {"success": False, "message": "No assistants assigned to course"}

        # Setup OR-Tools model for sections
        model = cp_model.CpModel()
        vars_dict = {}

        days = list(DayOfWeek)
        slots_per_day = 5
        slot_times = [
            (dtime(8, 0), dtime(10, 0)),
            (dtime(10, 0), dtime(12, 0)),
            (dtime(12, 30), dtime(14, 30)),
            (dtime(14, 30), dtime(16, 30)),
            (dtime(16, 30), dtime(18, 30)),
        ]

        # Create variables for section assignments
        for assistant in assistants:
            for hall in lab_halls:
                for d_idx, _ in enumerate(days):
                    for s_idx in range(slots_per_day):
                        var = model.NewBoolVar(
                            f"sec_a{assistant.assistant_id}_h{hall.id}_d{d_idx}_s{s_idx}"
                        )
                        vars_dict[(str(assistant.assistant_id), str(hall.id), d_idx, s_idx)] = var

        # Constraint: Each section group gets required slots
        total_sections = course.section_count
        section_vars = list(vars_dict.values())
        model.Add(sum(section_vars) == total_sections)

        # Constraint: Hall can host at most one section per slot
        for hall in lab_halls:
            for d_idx in range(len(days)):
                for s_idx in range(slots_per_day):
                    hall_slot_vars = [
                        vars_dict[k] for k in vars_dict
                        if k[1] == str(hall.id) and k[2] == d_idx and k[3] == s_idx
                    ]
                    if hall_slot_vars:
                        model.AddAtMostOne(hall_slot_vars)

        # Constraint: Assistant can only handle one section per slot
        for assistant in assistants:
            for d_idx in range(len(days)):
                for s_idx in range(slots_per_day):
                    asst_slot_vars = [
                        vars_dict[k] for k in vars_dict
                        if k[0] == str(assistant.assistant_id) and k[2] == d_idx and k[3] == s_idx
                    ]
                    if asst_slot_vars:
                        model.AddAtMostOne(asst_slot_vars)

        # Solve
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = max_solve_time
        status = solver.Solve(model)

        saved_count = 0
        if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            for k, var in vars_dict.items():
                if solver.Value(var):
                    assistant_id, hall_id, d_idx, s_idx = k

                    entry = ScheduleEntry(
                        semester_id=semester_id,
                        course_id=course_id,
                        hall_id=UUID(hall_id),
                        assistant_id=UUID(assistant_id),
                        entry_type=ScheduleEntryType.section,
                        day_of_week=days[d_idx],
                        start_time=slot_times[s_idx][0],
                        end_time=slot_times[s_idx][1],
                        ai_generated=True,
                    )
                    self.db.add(entry)
                    saved_count += 1

            await self.db.commit()

            return {
                "success": True,
                "status": "OPTIMAL" if status == cp_model.OPTIMAL else "FEASIBLE",
                "sections_generated": saved_count,
                "solve_time_seconds": round(time.time() - start_time, 2)
            }

        return {
            "success": False,
            "status": "INFEASIBLE",
            "message": "Could not schedule sections",
            "sections_generated": 0
        }

    async def validate_schedule(self, semester_id: UUID) -> Dict:
        """
        Validate existing schedule and detect conflicts.
        Returns detailed conflict report.
        """
        schedule = await self.sched_repo.get_by_semester(semester_id)

        hall_conflicts = []
        doctor_conflicts = []
        assistant_conflicts = []

        # Check hall conflicts
        for entry1 in schedule:
            for entry2 in schedule:
                if entry1.id != entry2.id:
                    if (entry1.hall_id == entry2.hall_id and
                        entry1.day_of_week == entry2.day_of_week and
                        self._time_overlaps(
                            entry1.start_time, entry1.end_time,
                            entry2.start_time, entry2.end_time
                        )):
                        hall_conflicts.append({
                            "entry1_id": str(entry1.id),
                            "entry2_id": str(entry2.id),
                            "hall_id": str(entry1.hall_id),
                            "day": entry1.day_of_week.value,
                            "time": f"{entry1.start_time}-{entry1.end_time}"
                        })

        # Check doctor conflicts
        for entry1 in schedule:
            for entry2 in schedule:
                if entry1.id != entry2.id:
                    if (entry1.doctor_id and entry2.doctor_id and
                        entry1.doctor_id == entry2.doctor_id and
                        entry1.day_of_week == entry2.day_of_week and
                        self._time_overlaps(
                            entry1.start_time, entry1.end_time,
                            entry2.start_time, entry2.end_time
                        )):
                        doctor_conflicts.append({
                            "entry1_id": str(entry1.id),
                            "entry2_id": str(entry2.id),
                            "doctor_id": str(entry1.doctor_id),
                            "day": entry1.day_of_week.value,
                            "time": f"{entry1.start_time}-{entry1.end_time}"
                        })

        # Check assistant conflicts
        for entry1 in schedule:
            for entry2 in schedule:
                if entry1.id != entry2.id:
                    if (entry1.assistant_id and entry2.assistant_id and
                        entry1.assistant_id == entry2.assistant_id and
                        entry1.day_of_week == entry2.day_of_week and
                        self._time_overlaps(
                            entry1.start_time, entry1.end_time,
                            entry2.start_time, entry2.end_time
                        )):
                        assistant_conflicts.append({
                            "entry1_id": str(entry1.id),
                            "entry2_id": str(entry2.id),
                            "assistant_id": str(entry1.assistant_id),
                            "day": entry1.day_of_week.value,
                            "time": f"{entry1.start_time}-{entry1.end_time}"
                        })

        total_conflicts = len(hall_conflicts) + len(doctor_conflicts) + len(assistant_conflicts)

        return {
            "semester_id": str(semester_id),
            "total_entries": len(schedule),
            "total_conflicts": total_conflicts,
            "is_valid": total_conflicts == 0,
            "hall_conflicts": hall_conflicts,
            "doctor_conflicts": doctor_conflicts,
            "assistant_conflicts": assistant_conflicts,
            "conflict_summary": {
                "hall_conflicts_count": len(hall_conflicts),
                "doctor_conflicts_count": len(doctor_conflicts),
                "assistant_conflicts_count": len(assistant_conflicts)
            }
        }

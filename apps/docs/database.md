# Database Architecture

HITU uses Supabase PostgreSQL as the system of record and SQLAlchemy 2.x as the application ORM.

## Core Domains

| Domain | Tables |
| --- | --- |
| Identity and RBAC | `users`, `roles`, `permissions`, `user_roles`, `role_permissions` |
| Academic structure | `semesters`, `departments`, `academic_levels`, `courses` |
| Scheduling | `halls`, `hall_availability`, `doctor_availability`, `assistant_availability`, `schedules`, `schedule_slots`, `course_assignments` |
| Enrollment | `students`, `student_courses` |
| LMS | `materials`, `assignments`, `submissions`, `notifications` |
| Operations | `audit_logs`, `analytics`, `exports` |

## Migration Workflow

```bash
cd apps/backend
alembic upgrade head
alembic current
```

## Supabase Notes

- Use the Supabase pooler URL for `DATABASE_URL`.
- URL-encode special characters in database passwords.
- Keep service role keys only in backend environment variables or deployment secrets.
- Do not expose service role keys through Vite or browser code.

## Required Environment

```bash
DATABASE_URL=postgresql://<user>:<password>@<host>:6543/postgres
JWT_SECRET=<minimum-32-character-random-secret>
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
REDIS_URL=redis://localhost:6379/0
OLLAMA_URL=http://localhost:11434
```

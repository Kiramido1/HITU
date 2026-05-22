# Contributing to HITU AI Platform

Thank you for improving HITU. This project treats scheduling, learning workflows, and academic operations as production systems, so changes should be deliberate, reviewed, and validated.

## Development Workflow

1. Create a branch from `main`.
2. Copy `.env.example` to `.env` and provide local secrets outside Git.
3. Install dependencies:

```bash
make install-backend
make install-frontend
```

4. Run the relevant checks before opening a pull request:

```bash
make test-backend
make test-frontend
cd apps/frontend && npm run build
```

## Database Changes

- Update SQLAlchemy models in `apps/backend/app/models`.
- Add an Alembic revision in `apps/backend/alembic/versions`.
- Validate with `cd apps/backend && alembic upgrade head`.
- Never place credentials, Supabase keys, or real connection strings in migrations, seed data, tests, README files, or examples.

## Security Rules

- Do not commit `.env`, private keys, service role keys, database passwords, JWT secrets, or provider tokens.
- Use GitHub Secrets for CI/CD values.
- Use Docker secrets or environment variables for deployments.
- Keep service role keys strictly server-side.
- Do not expose secrets in frontend code, Vite variables, screenshots, logs, or test fixtures.

## Pull Request Expectations

- Explain the user or platform problem being solved.
- Include validation evidence.
- Call out migrations and rollout considerations.
- Keep unrelated refactors out of feature or bugfix branches.

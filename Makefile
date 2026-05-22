SHELL := /bin/bash
COMPOSE := docker compose

.PHONY: help install-backend install-frontend dev-backend dev-frontend test-backend test-frontend build migrate seed up up-ai up-local-db down logs ps health clean

help:
	@printf "\nHITU AI Platform commands\n"
	@printf "  make install-backend   Install Python dependencies\n"
	@printf "  make install-frontend  Install frontend dependencies\n"
	@printf "  make dev-backend       Run FastAPI locally\n"
	@printf "  make dev-frontend      Run Vite locally\n"
	@printf "  make test-backend      Run backend tests\n"
	@printf "  make test-frontend     Run frontend tests\n"
	@printf "  make migrate           Apply Alembic migrations\n"
	@printf "  make seed              Seed reference data\n"
	@printf "  make up                Start production Compose stack\n"
	@printf "  make up-ai             Start stack with Ollama profile\n"
	@printf "  make up-local-db       Start stack with local Postgres profile\n"
	@printf "  make down              Stop Compose stack\n"
	@printf "  make health            Check API health endpoint\n\n"

install-backend:
	cd apps/backend && python -m pip install -r requirements.txt

install-frontend:
	cd apps/frontend && npm ci

dev-backend:
	cd apps/backend && uvicorn main:app --host 127.0.0.1 --port 8000 --reload

dev-frontend:
	cd apps/frontend && npm run dev -- --host 127.0.0.1

test-backend:
	cd apps/backend && pytest tests -v

test-frontend:
	cd apps/frontend && npm test -- --run

build:
	cd apps/frontend && npm run build

migrate:
	cd apps/backend && alembic upgrade head

seed:
	cd apps/backend && python seed.py

up:
	$(COMPOSE) up -d --build

up-ai:
	$(COMPOSE) --profile ai up -d --build

up-local-db:
	$(COMPOSE) --profile local-db up -d --build

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f --tail=100

ps:
	$(COMPOSE) ps

health:
	curl -fsS http://localhost/api/v1/health

clean:
	$(COMPOSE) down -v --remove-orphans

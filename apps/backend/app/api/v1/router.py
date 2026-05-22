"""
API v1 main router. Includes all sub-routers.
"""
from fastapi import APIRouter

from app.api.v1.endpoints import academic, export, lms, users, scheduler
from app.auth.router import router as auth_router

api_router = APIRouter()

# Register sub-routers
api_router.include_router(auth_router)
api_router.include_router(users.router)
api_router.include_router(academic.router)
api_router.include_router(lms.router)
api_router.include_router(scheduler.router)
api_router.include_router(export.router)

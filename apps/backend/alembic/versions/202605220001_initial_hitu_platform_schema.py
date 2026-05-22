"""initial HITU AI Platform schema

Revision ID: 202605220001
Revises:
Create Date: 2026-05-22
"""
from alembic import op

from app.database.base import Base
import app.models.user  # noqa: F401
import app.models.academic  # noqa: F401
import app.models.lms  # noqa: F401
import app.models.platform  # noqa: F401


revision = "202605220001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    Base.metadata.create_all(bind=bind)


def downgrade() -> None:
    bind = op.get_bind()
    Base.metadata.drop_all(bind=bind)

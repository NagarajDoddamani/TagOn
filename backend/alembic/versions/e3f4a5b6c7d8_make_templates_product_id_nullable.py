"""make templates product_id nullable

Revision ID: e3f4a5b6c7d8
Revises: d2e3f4a5b6c7
Create Date: 2026-07-01

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = 'e3f4a5b6c7d8'
down_revision = 'd2e3f4a5b6c7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column('templates', 'product_id', nullable=True)


def downgrade() -> None:
    op.alter_column('templates', 'product_id', nullable=False)

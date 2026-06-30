"""Add template_groups table and template_group_id to products/templates

Revision ID: c1d2e3f4a5b6
Revises: b1c2d3e4f5a6
Create Date: 2026-06-30

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "c1d2e3f4a5b6"
down_revision: Union[str, None] = "b1c2d3e4f5a6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "template_groups",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("preview_image", sa.String(500), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="active"),
        sa.Column("is_deleted", sa.Boolean(), default=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
    )

    op.add_column("products", sa.Column("template_group_id", UUID(as_uuid=True), sa.ForeignKey("template_groups.id"), nullable=True))
    op.create_index("ix_products_template_group_id", "products", ["template_group_id"])

    op.add_column("templates", sa.Column("template_group_id", UUID(as_uuid=True), sa.ForeignKey("template_groups.id"), nullable=True))
    op.create_index("ix_templates_template_group_id", "templates", ["template_group_id"])


def downgrade() -> None:
    op.drop_index("ix_templates_template_group_id")
    op.drop_column("templates", "template_group_id")
    op.drop_index("ix_products_template_group_id")
    op.drop_column("products", "template_group_id")
    op.drop_table("template_groups")

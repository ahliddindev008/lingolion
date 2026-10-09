"""Add shared pre-generated course lesson content."""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20261007_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "shared_course_lesson_content",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("source_language", sa.String(length=50), nullable=False),
        sa.Column("target_language", sa.String(length=50), nullable=False),
        sa.Column("level", sa.String(length=5), nullable=False),
        sa.Column("unit_number", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("topic", sa.String(length=255), nullable=True),
        sa.Column("content", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.UniqueConstraint(
            "source_language",
            "target_language",
            "level",
            "unit_number",
            name="uq_shared_course_lesson",
        ),
    )
    op.create_index(
        "ix_shared_course_lesson_content_id",
        "shared_course_lesson_content",
        ["id"],
    )


def downgrade() -> None:
    op.drop_index("ix_shared_course_lesson_content_id", table_name="shared_course_lesson_content")
    op.drop_table("shared_course_lesson_content")

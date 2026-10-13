"""Cache learner-requested custom lesson topics for matching learners."""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20261013_0009"
down_revision: Union[str, None] = "20261011_0008"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "shared_custom_lesson_content",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("source_language", sa.String(length=50), nullable=False),
        sa.Column("target_language", sa.String(length=50), nullable=False),
        sa.Column("level", sa.String(length=5), nullable=False),
        sa.Column("topic_key", sa.String(length=255), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("topic", sa.String(length=255), nullable=True),
        sa.Column("content", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.UniqueConstraint(
            "source_language",
            "target_language",
            "level",
            "topic_key",
            name="uq_shared_custom_lesson",
        ),
    )
    op.create_index(
        "ix_shared_custom_lesson_content_id",
        "shared_custom_lesson_content",
        ["id"],
    )
    op.create_index(
        "ix_shared_custom_lesson_lookup",
        "shared_custom_lesson_content",
        ["source_language", "target_language", "level", "topic_key"],
    )


def downgrade() -> None:
    op.drop_index("ix_shared_custom_lesson_lookup", table_name="shared_custom_lesson_content")
    op.drop_index("ix_shared_custom_lesson_content_id", table_name="shared_custom_lesson_content")
    op.drop_table("shared_custom_lesson_content")
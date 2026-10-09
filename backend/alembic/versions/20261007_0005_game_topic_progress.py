"""Persist per-game topic progression."""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20261007_0005"
down_revision: Union[str, None] = "20261007_0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("game_scores") as batch_op:
        batch_op.add_column(sa.Column("topic_id", sa.String(length=50), nullable=True))
        batch_op.add_column(
            sa.Column(
                "language_pair_id",
                sa.Integer(),
                sa.ForeignKey("language_pairs.id", ondelete="SET NULL"),
                nullable=True,
            )
        )
        batch_op.create_index(
            "ix_game_scores_topic_progress",
            ["user_id", "game_type", "language_pair_id", "topic_id", "score"],
        )


def downgrade() -> None:
    with op.batch_alter_table("game_scores") as batch_op:
        batch_op.drop_index("ix_game_scores_topic_progress")
        batch_op.drop_column("language_pair_id")
        batch_op.drop_column("topic_id")

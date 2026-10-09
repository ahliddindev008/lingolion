"""Add per-user conversation clearing state."""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20261007_0002"
down_revision: Union[str, None] = "20261007_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "chat_room_states",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("room", sa.String(length=100), nullable=False),
        sa.Column("cleared_at", sa.DateTime(), nullable=False),
        sa.UniqueConstraint("user_id", "room", name="uq_user_chat_room_state"),
    )
    op.create_index("ix_chat_room_states_id", "chat_room_states", ["id"])
    op.create_index("ix_chat_room_states_user_id", "chat_room_states", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_chat_room_states_user_id", table_name="chat_room_states")
    op.drop_index("ix_chat_room_states_id", table_name="chat_room_states")
    op.drop_table("chat_room_states")

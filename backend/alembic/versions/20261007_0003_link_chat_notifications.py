"""Link chat notifications to their messages."""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20261007_0003"
down_revision: Union[str, None] = "20261007_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("notifications") as batch_op:
        batch_op.add_column(
            sa.Column(
                "chat_message_id",
                sa.Integer(),
                sa.ForeignKey(
                    "chat_messages.id",
                    ondelete="CASCADE",
                    name="fk_notifications_chat_message_id_chat_messages",
                ),
                nullable=True,
            )
        )
        batch_op.create_index("ix_notifications_chat_message_id", ["chat_message_id"])


def downgrade() -> None:
    with op.batch_alter_table("notifications") as batch_op:
        batch_op.drop_index("ix_notifications_chat_message_id")
        batch_op.drop_column("chat_message_id")

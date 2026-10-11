"""Add reply_to_id to chat messages.

Revision ID: 20261011_0006
Revises: 20261007_0005
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20261011_0006"
down_revision: Union[str, None] = "20261007_0005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("chat_messages") as batch_op:
        batch_op.add_column(
            sa.Column("reply_to_id", sa.Integer(), nullable=True)
        )
        batch_op.create_foreign_key(
            "fk_chat_messages_reply_to_id_chat_messages",
            "chat_messages",
            ["reply_to_id"],
            ["id"],
            ondelete="SET NULL",
        )
        batch_op.create_index(
            "ix_chat_messages_reply_to_id",
            ["reply_to_id"],
        )


def downgrade() -> None:
    with op.batch_alter_table("chat_messages") as batch_op:
        batch_op.drop_index("ix_chat_messages_reply_to_id")
        batch_op.drop_constraint(
            "fk_chat_messages_reply_to_id_chat_messages",
            type_="foreignkey",
        )
        batch_op.drop_column("reply_to_id")

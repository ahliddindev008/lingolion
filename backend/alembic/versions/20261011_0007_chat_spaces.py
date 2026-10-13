"""Add chat spaces (WhatsApp-style groups and channels).

Revision ID: 20261011_0007
Revises: 20261011_0006
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20261011_0007"
down_revision: Union[str, None] = "20261011_0006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "chat_spaces",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("kind", sa.String(length=20), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("description", sa.String(length=500), nullable=True),
        sa.Column("room", sa.String(length=100), nullable=False),
        sa.Column("invite_code", sa.String(length=16), nullable=False),
        sa.Column("creator_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["creator_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("room", name="uq_chat_spaces_room"),
        sa.UniqueConstraint("invite_code", name="uq_chat_spaces_invite_code"),
    )
    op.create_index("ix_chat_spaces_id", "chat_spaces", ["id"])
    op.create_index("ix_chat_spaces_room", "chat_spaces", ["room"])
    op.create_index("ix_chat_spaces_invite_code", "chat_spaces", ["invite_code"])
    op.create_index("ix_chat_spaces_creator_id", "chat_spaces", ["creator_id"])

    op.create_table(
        "chat_space_members",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("space_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("role", sa.String(length=20), nullable=False),
        sa.Column("joined_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["space_id"], ["chat_spaces.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("space_id", "user_id", name="uq_chat_space_member"),
    )
    op.create_index("ix_chat_space_members_id", "chat_space_members", ["id"])
    op.create_index("ix_chat_space_members_space_id", "chat_space_members", ["space_id"])
    op.create_index("ix_chat_space_members_user_id", "chat_space_members", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_chat_space_members_user_id", table_name="chat_space_members")
    op.drop_index("ix_chat_space_members_space_id", table_name="chat_space_members")
    op.drop_index("ix_chat_space_members_id", table_name="chat_space_members")
    op.drop_table("chat_space_members")
    op.drop_index("ix_chat_spaces_creator_id", table_name="chat_spaces")
    op.drop_index("ix_chat_spaces_invite_code", table_name="chat_spaces")
    op.drop_index("ix_chat_spaces_room", table_name="chat_spaces")
    op.drop_index("ix_chat_spaces_id", table_name="chat_spaces")
    op.drop_table("chat_spaces")

"""Persist user inventory items from the profile shop."""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20261016_0010"
down_revision: Union[str, None] = "20261013_0009"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "user_inventory_items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("item_code", sa.String(length=50), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("is_equipped", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.UniqueConstraint("user_id", "item_code", name="uq_user_inventory_item_code"),
    )
    op.create_index("ix_user_inventory_items_user_id", "user_inventory_items", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_user_inventory_items_user_id", table_name="user_inventory_items")
    op.drop_table("user_inventory_items")

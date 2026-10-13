"""Drop chat spaces (groups & channels removed from the product).

Revision ID: 20261011_0008
Revises: 20261011_0007
"""
from typing import Sequence, Union

from alembic import op


revision: str = "20261011_0008"
down_revision: Union[str, None] = "20261011_0007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_table("chat_space_members")
    op.drop_table("chat_spaces")


def downgrade() -> None:
    raise NotImplementedError("Chat spaces are permanently removed; downgrade is not supported.")
"""Store the profile photo a learner picks from their own gallery."""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20261020_0012"
down_revision: Union[str, None] = "20261016_0011"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.add_column(sa.Column("avatar_url", sa.Text(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_column("avatar_url")
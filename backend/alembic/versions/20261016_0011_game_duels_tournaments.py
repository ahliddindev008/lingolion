"""Persist coin-stake duels and weekly tournaments."""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20261016_0011"
down_revision: Union[str, None] = "20261016_0010"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "game_duels",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("challenger_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("opponent_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("game_type", sa.String(length=50), nullable=False),
        sa.Column("topic_id", sa.String(length=50), nullable=False),
        sa.Column("stake", sa.Integer(), nullable=False, server_default="10"),
        sa.Column("source_language", sa.String(length=10), nullable=False),
        sa.Column("target_language", sa.String(length=10), nullable=False),
        sa.Column("seed", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="pending"),
        sa.Column("challenger_score", sa.Integer(), nullable=True),
        sa.Column("opponent_score", sa.Integer(), nullable=True),
        sa.Column("winner_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("resolved_at", sa.DateTime(), nullable=True),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_game_duels_players", "game_duels", ["challenger_id", "opponent_id", "status"])

    op.create_table(
        "weekly_tournaments",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("week", sa.Integer(), nullable=False),
        sa.Column("game_type", sa.String(length=50), nullable=False),
        sa.Column("entry_fee", sa.Integer(), nullable=False, server_default="50"),
        sa.Column("prize_pool", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("settled", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.UniqueConstraint("year", "week", name="uq_tournament_year_week"),
    )

    op.create_table(
        "tournament_entries",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("tournament_id", sa.Integer(), sa.ForeignKey("weekly_tournaments.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("best_score", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.UniqueConstraint("tournament_id", "user_id", name="uq_tournament_entry"),
    )


def downgrade() -> None:
    op.drop_table("tournament_entries")
    op.drop_table("weekly_tournaments")
    op.drop_index("ix_game_duels_players", table_name="game_duels")
    op.drop_table("game_duels")

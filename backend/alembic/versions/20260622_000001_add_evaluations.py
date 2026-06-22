"""add evaluations

Revision ID: a1b2c3d4e5f6
Revises: 801b86be184b
Create Date: 2026-06-22 00:00:01.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '801b86be184b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'evaluations',
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('filename', sa.String(length=255), nullable=False),
        sa.Column('candidate_name', sa.String(length=255), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('model_used', sa.String(length=64), nullable=False),
        sa.Column('final_score', sa.Float(), nullable=False),
        sa.Column('result', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('fk_evaluations_user_id_users'), ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_evaluations')),
    )
    op.create_index(op.f('ix_evaluations_user_id'), 'evaluations', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_evaluations_user_id'), table_name='evaluations')
    op.drop_table('evaluations')

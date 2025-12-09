"""add llm_usage table for token tracking

Revision ID: 007_add_llm_usage_table
Revises: 006_add_role_to_users
Create Date: 2025-12-09
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '007_add_llm_usage_table'
down_revision = '006_add_role_to_users'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'llm_usage',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column('run_id', postgresql.UUID(as_uuid=False), nullable=True),
        sa.Column('model', sa.String(length=100), nullable=False),
        sa.Column('prompt_tokens', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('completion_tokens', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('total_tokens', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('cost_usd', sa.Numeric(12, 6), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index(op.f('ix_llm_usage_run_id'), 'llm_usage', ['run_id'], unique=False)
    op.create_index(op.f('ix_llm_usage_created_at'), 'llm_usage', ['created_at'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_llm_usage_created_at'), table_name='llm_usage')
    op.drop_index(op.f('ix_llm_usage_run_id'), table_name='llm_usage')
    op.drop_table('llm_usage')



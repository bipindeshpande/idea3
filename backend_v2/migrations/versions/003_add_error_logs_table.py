"""Add error_logs table

Revision ID: 003_add_error_logs
Revises: 095f38068f0c
Create Date: 2024-01-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '003_add_error_logs'
down_revision = '095f38068f0c'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'error_logs',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('request_id', sa.String(length=255), nullable=True),
        sa.Column('run_id', postgresql.UUID(as_uuid=False), nullable=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=False), nullable=True),
        sa.Column('error_type', sa.String(length=255), nullable=False),
        sa.Column('error_message', sa.Text(), nullable=False),
        sa.Column('error_traceback', sa.Text(), nullable=True),
        sa.Column('context', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('endpoint', sa.String(length=255), nullable=True),
        sa.Column('method', sa.String(length=10), nullable=True),
        sa.Column('severity', sa.String(length=50), server_default='error', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_error_logs_request_id'), 'error_logs', ['request_id'], unique=False)
    op.create_index(op.f('ix_error_logs_run_id'), 'error_logs', ['run_id'], unique=False)
    op.create_index(op.f('ix_error_logs_user_id'), 'error_logs', ['user_id'], unique=False)
    op.create_index(op.f('ix_error_logs_severity'), 'error_logs', ['severity'], unique=False)
    op.create_index(op.f('ix_error_logs_created_at'), 'error_logs', ['created_at'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_error_logs_created_at'), table_name='error_logs')
    op.drop_index(op.f('ix_error_logs_severity'), table_name='error_logs')
    op.drop_index(op.f('ix_error_logs_user_id'), table_name='error_logs')
    op.drop_index(op.f('ix_error_logs_run_id'), table_name='error_logs')
    op.drop_index(op.f('ix_error_logs_request_id'), table_name='error_logs')
    op.drop_table('error_logs')


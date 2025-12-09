"""Add rate_limit_logs table

Revision ID: 005_add_rate_limit_logs
Revises: 004_add_deleted_at
Create Date: 2024-01-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '005_add_rate_limit_logs'
down_revision = '004_add_deleted_at'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'rate_limit_logs',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('ip_address', sa.String(length=45), nullable=False),
        sa.Column('endpoint', sa.String(length=255), nullable=False),
        sa.Column('request_count', sa.Integer(), nullable=False),
        sa.Column('limit', sa.Integer(), nullable=False),
        sa.Column('request_id', sa.String(length=255), nullable=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=False), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_rate_limit_logs_ip_address'), 'rate_limit_logs', ['ip_address'], unique=False)
    op.create_index(op.f('ix_rate_limit_logs_endpoint'), 'rate_limit_logs', ['endpoint'], unique=False)
    op.create_index(op.f('ix_rate_limit_logs_request_id'), 'rate_limit_logs', ['request_id'], unique=False)
    op.create_index(op.f('ix_rate_limit_logs_user_id'), 'rate_limit_logs', ['user_id'], unique=False)
    op.create_index(op.f('ix_rate_limit_logs_created_at'), 'rate_limit_logs', ['created_at'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_rate_limit_logs_created_at'), table_name='rate_limit_logs')
    op.drop_index(op.f('ix_rate_limit_logs_user_id'), table_name='rate_limit_logs')
    op.drop_index(op.f('ix_rate_limit_logs_request_id'), table_name='rate_limit_logs')
    op.drop_index(op.f('ix_rate_limit_logs_endpoint'), table_name='rate_limit_logs')
    op.drop_index(op.f('ix_rate_limit_logs_ip_address'), table_name='rate_limit_logs')
    op.drop_table('rate_limit_logs')


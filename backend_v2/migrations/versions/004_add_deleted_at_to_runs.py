"""Add deleted_at to runs table

Revision ID: 004_add_deleted_at
Revises: 003_add_error_logs
Create Date: 2024-01-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '004_add_deleted_at'
down_revision = '003_add_error_logs'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('runs', sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True))
    op.create_index(op.f('ix_runs_deleted_at'), 'runs', ['deleted_at'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_runs_deleted_at'), table_name='runs')
    op.drop_column('runs', 'deleted_at')


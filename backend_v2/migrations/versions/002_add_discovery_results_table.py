"""Add discovery_results table

Revision ID: 002_add_discovery_results
Revises: 001_initial
Create Date: 2024-12-09 04:45:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002_add_discovery_results'
down_revision = '001_initial'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create discovery_results table
    op.create_table(
        'discovery_results',
        sa.Column('id', postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column('run_id', postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column('input_payload', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('result', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='completed'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['run_id'], ['runs.run_id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_discovery_results_run_id'), 'discovery_results', ['run_id'], unique=False)
    op.create_index(op.f('ix_discovery_results_status'), 'discovery_results', ['status'], unique=False)
    op.create_index(op.f('ix_discovery_results_created_at'), 'discovery_results', ['created_at'], unique=False)


def downgrade() -> None:
    # Drop indexes
    op.drop_index(op.f('ix_discovery_results_created_at'), table_name='discovery_results')
    op.drop_index(op.f('ix_discovery_results_status'), table_name='discovery_results')
    op.drop_index(op.f('ix_discovery_results_run_id'), table_name='discovery_results')
    
    # Drop table
    op.drop_table('discovery_results')


"""add founder_psychology table

Revision ID: 011_add_founder_psychology_table
Revises: 010_add_psyche_versioning
Create Date: 2025-12-12
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '011_add_founder_psychology_table'
down_revision = '010_psyche_versioning'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create founder_psychology table
    op.create_table(
        'founder_psychology',
        sa.Column('id', postgresql.UUID(as_uuid=False), primary_key=True, nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column('motivation', sa.String(length=255), nullable=True),
        sa.Column('motivation_other', sa.Text(), nullable=True),
        sa.Column('fear', sa.String(length=255), nullable=True),
        sa.Column('fear_other', sa.Text(), nullable=True),
        sa.Column('decision_style', sa.String(length=50), nullable=True),
        sa.Column('energy_pattern', sa.String(length=50), nullable=True),
        sa.Column('consistency_pattern', sa.String(length=50), nullable=True),
        sa.Column('risk_approach', sa.String(length=50), nullable=True),
        sa.Column('success_definition', sa.String(length=255), nullable=True),
        sa.Column('success_other', sa.Text(), nullable=True),
        sa.Column('archetype', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ondelete='CASCADE'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_founder_psychology_user_id'), 'founder_psychology', ['user_id'], unique=True)
    op.create_index('idx_founder_psychology_user_id', 'founder_psychology', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index('idx_founder_psychology_user_id', table_name='founder_psychology')
    op.drop_index(op.f('ix_founder_psychology_user_id'), table_name='founder_psychology')
    op.drop_table('founder_psychology')


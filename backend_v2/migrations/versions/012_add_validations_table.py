"""add validations table

Revision ID: 012_add_validations_table
Revises: 011_add_founder_psychology_table
Create Date: 2025-12-12
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '012_add_validations_table'
down_revision = '011_add_founder_psychology_table'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create validations table
    op.create_table(
        'validations',
        sa.Column('validation_id', postgresql.UUID(as_uuid=False), primary_key=True, nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=False), nullable=True),
        sa.Column('category_answers', postgresql.JSONB(), nullable=False),
        sa.Column('idea_explanation', sa.Text(), nullable=False),
        sa.Column('validation_result', postgresql.JSONB(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=True, server_default='completed'),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ),
    )
    op.create_index(op.f('ix_validations_user_id'), 'validations', ['user_id'], unique=False)
    op.create_index(op.f('ix_validations_status'), 'validations', ['status'], unique=False)
    op.create_index(op.f('ix_validations_created_at'), 'validations', ['created_at'], unique=False)
    op.create_index(op.f('ix_validations_deleted_at'), 'validations', ['deleted_at'], unique=False)
    op.create_index('idx_validations_user_created', 'validations', ['user_id', 'created_at'], unique=False)
    op.create_index('idx_validations_status', 'validations', ['status'], unique=False)


def downgrade() -> None:
    op.drop_index('idx_validations_status', table_name='validations')
    op.drop_index('idx_validations_user_created', table_name='validations')
    op.drop_index(op.f('ix_validations_deleted_at'), table_name='validations')
    op.drop_index(op.f('ix_validations_created_at'), table_name='validations')
    op.drop_index(op.f('ix_validations_status'), table_name='validations')
    op.drop_index(op.f('ix_validations_user_id'), table_name='validations')
    op.drop_table('validations')


"""add saved_frameworks table

Revision ID: a8b9077d4af1
Revises: 013_add_founder_network_tables
Create Date: 2025-01-15
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'a8b9077d4af1'
down_revision = '013_add_founder_network_tables'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create saved_frameworks table
    op.create_table(
        'saved_frameworks',
        sa.Column('id', postgresql.UUID(as_uuid=False), primary_key=True, nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column('framework_template_id', sa.Integer(), nullable=False),
        sa.Column('customized_content', sa.Text(), nullable=False),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=True, server_default='draft'),
        sa.Column('progress_percentage', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('linked_idea_id', sa.String(length=255), nullable=True),
        sa.Column('linked_validation_id', postgresql.UUID(as_uuid=False), nullable=True),
        sa.Column('extra_metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['linked_validation_id'], ['validations.validation_id'], ondelete='SET NULL'),
    )
    
    # Create indexes
    op.create_index('ix_saved_frameworks_user_id', 'saved_frameworks', ['user_id'], unique=False)
    op.create_index('ix_saved_frameworks_status', 'saved_frameworks', ['status'], unique=False)
    op.create_index('ix_saved_frameworks_created_at', 'saved_frameworks', ['created_at'], unique=False)
    op.create_index('ix_saved_frameworks_deleted_at', 'saved_frameworks', ['deleted_at'], unique=False)
    op.create_index('ix_saved_frameworks_framework_template_id', 'saved_frameworks', ['framework_template_id'], unique=False)
    op.create_index('ix_saved_frameworks_linked_idea_id', 'saved_frameworks', ['linked_idea_id'], unique=False)
    op.create_index('ix_saved_frameworks_linked_validation_id', 'saved_frameworks', ['linked_validation_id'], unique=False)
    op.create_index('idx_saved_frameworks_user_status', 'saved_frameworks', ['user_id', 'status'], unique=False)
    op.create_index('idx_saved_frameworks_user_created', 'saved_frameworks', ['user_id', 'created_at'], unique=False)
    op.create_index('idx_saved_frameworks_template', 'saved_frameworks', ['framework_template_id'], unique=False)


def downgrade() -> None:
    # Drop indexes
    op.drop_index('idx_saved_frameworks_template', table_name='saved_frameworks')
    op.drop_index('idx_saved_frameworks_user_created', table_name='saved_frameworks')
    op.drop_index('idx_saved_frameworks_user_status', table_name='saved_frameworks')
    op.drop_index('ix_saved_frameworks_linked_validation_id', table_name='saved_frameworks')
    op.drop_index('ix_saved_frameworks_linked_idea_id', table_name='saved_frameworks')
    op.drop_index('ix_saved_frameworks_framework_template_id', table_name='saved_frameworks')
    op.drop_index('ix_saved_frameworks_deleted_at', table_name='saved_frameworks')
    op.drop_index('ix_saved_frameworks_created_at', table_name='saved_frameworks')
    op.drop_index('ix_saved_frameworks_status', table_name='saved_frameworks')
    op.drop_index('ix_saved_frameworks_user_id', table_name='saved_frameworks')
    
    # Drop table
    op.drop_table('saved_frameworks')

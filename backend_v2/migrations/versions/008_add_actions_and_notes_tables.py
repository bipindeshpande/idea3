"""add actions and notes tables

Revision ID: 008_add_actions_and_notes_tables
Revises: 007_add_llm_usage_table
Create Date: 2025-01-XX
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '008_add_actions_and_notes_tables'
down_revision = '007_add_llm_usage_table'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create actions table
    op.create_table(
        'actions',
        sa.Column('id', postgresql.UUID(as_uuid=False), primary_key=True, nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column('idea_id', sa.String(length=255), nullable=False),
        sa.Column('action_text', sa.String(length=1000), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='pending'),
        sa.Column('due_date', sa.Date(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ),
    )
    op.create_index(op.f('ix_actions_user_id'), 'actions', ['user_id'], unique=False)
    op.create_index(op.f('ix_actions_idea_id'), 'actions', ['idea_id'], unique=False)
    op.create_index(op.f('ix_actions_status'), 'actions', ['status'], unique=False)
    op.create_index('idx_actions_user_idea', 'actions', ['user_id', 'idea_id'], unique=False)
    
    # Create notes table
    op.create_table(
        'notes',
        sa.Column('id', postgresql.UUID(as_uuid=False), primary_key=True, nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column('idea_id', sa.String(length=255), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('tags', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ),
    )
    op.create_index(op.f('ix_notes_user_id'), 'notes', ['user_id'], unique=False)
    op.create_index(op.f('ix_notes_idea_id'), 'notes', ['idea_id'], unique=False)
    op.create_index('idx_notes_user_idea', 'notes', ['user_id', 'idea_id'], unique=False)


def downgrade() -> None:
    op.drop_index('idx_notes_user_idea', table_name='notes')
    op.drop_index(op.f('ix_notes_idea_id'), table_name='notes')
    op.drop_index(op.f('ix_notes_user_id'), table_name='notes')
    op.drop_table('notes')
    
    op.drop_index('idx_actions_user_idea', table_name='actions')
    op.drop_index(op.f('ix_actions_status'), table_name='actions')
    op.drop_index(op.f('ix_actions_idea_id'), table_name='actions')
    op.drop_index(op.f('ix_actions_user_id'), table_name='actions')
    op.drop_table('actions')


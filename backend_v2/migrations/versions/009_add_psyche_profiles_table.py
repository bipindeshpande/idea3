"""Add psyche_profiles table

Revision ID: 009_psyche_profiles
Revises: 008_add_actions_and_notes_tables
Create Date: 2024-12-20 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '009_psyche_profiles'
down_revision = '008_add_actions_and_notes_tables'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create psyche_profiles table
    op.create_table(
        'psyche_profiles',
        sa.Column('profile_id', postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column('personality', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('decision_style', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('motivation', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('confidence', sa.String(length=10), nullable=False),
        sa.Column('raw_answers', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('optional_text', sa.Text(), nullable=True),
        sa.Column('version', sa.String(length=10), nullable=True, server_default='1.0'),
        sa.Column('psyche_version', sa.String(length=10), nullable=True),
        sa.Column('computed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('profile_id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_psyche_profiles_user_id'), 'psyche_profiles', ['user_id'], unique=True)
    op.create_index(op.f('ix_psyche_profiles_created_at'), 'psyche_profiles', ['created_at'], unique=False)
    op.create_index('idx_psyche_profiles_user_created', 'psyche_profiles', ['user_id', 'created_at'], unique=False)


def downgrade() -> None:
    # Drop indexes
    op.drop_index('idx_psyche_profiles_user_created', table_name='psyche_profiles')
    op.drop_index(op.f('ix_psyche_profiles_created_at'), table_name='psyche_profiles')
    op.drop_index(op.f('ix_psyche_profiles_user_id'), table_name='psyche_profiles')
    
    # Drop table
    op.drop_table('psyche_profiles')


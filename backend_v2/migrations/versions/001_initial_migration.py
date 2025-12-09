"""Initial migration with PostgreSQL JSONB

Revision ID: 001_initial
Revises: 
Create Date: 2024-12-08 20:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('user_id', postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=True),
        sa.Column('full_name', sa.String(length=255), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('is_verified', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('subscription_type', sa.String(length=50), nullable=True, server_default='free'),
        sa.Column('preferences', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('last_login', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('user_id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    
    # Create runs table
    op.create_table(
        'runs',
        sa.Column('run_id', postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=False), nullable=True),
        sa.Column('inputs', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('reports', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('profile_analysis', sa.Text(), nullable=True),
        sa.Column('personalized_recommendations', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=True, server_default='pending'),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ),
        sa.PrimaryKeyConstraint('run_id')
    )
    op.create_index(op.f('ix_runs_user_id'), 'runs', ['user_id'], unique=False)
    op.create_index(op.f('ix_runs_status'), 'runs', ['status'], unique=False)
    op.create_index(op.f('ix_runs_created_at'), 'runs', ['created_at'], unique=False)
    op.create_index('idx_runs_user_created', 'runs', ['user_id', 'created_at'], unique=False)
    
    # Create cache_entries table
    op.create_table(
        'cache_entries',
        sa.Column('cache_key_hash', sa.String(length=64), nullable=False),
        sa.Column('cache_key', sa.String(length=500), nullable=False),
        sa.Column('cache_value', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('cache_type', sa.String(length=50), nullable=False),
        sa.Column('ttl_seconds', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('cache_key_hash')
    )
    op.create_index(op.f('ix_cache_entries_cache_key'), 'cache_entries', ['cache_key'], unique=False)
    op.create_index(op.f('ix_cache_entries_cache_type'), 'cache_entries', ['cache_type'], unique=False)
    op.create_index(op.f('ix_cache_entries_created_at'), 'cache_entries', ['created_at'], unique=False)
    op.create_index(op.f('ix_cache_entries_expires_at'), 'cache_entries', ['expires_at'], unique=False)
    op.create_index('idx_cache_expires', 'cache_entries', ['expires_at'], unique=False)
    op.create_index('idx_cache_type_expires', 'cache_entries', ['cache_type', 'expires_at'], unique=False)


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_index('idx_cache_type_expires', table_name='cache_entries')
    op.drop_index('idx_cache_expires', table_name='cache_entries')
    op.drop_index(op.f('ix_cache_entries_expires_at'), table_name='cache_entries')
    op.drop_index(op.f('ix_cache_entries_created_at'), table_name='cache_entries')
    op.drop_index(op.f('ix_cache_entries_cache_type'), table_name='cache_entries')
    op.drop_index(op.f('ix_cache_entries_cache_key'), table_name='cache_entries')
    op.drop_table('cache_entries')
    
    op.drop_index('idx_runs_user_created', table_name='runs')
    op.drop_index(op.f('ix_runs_created_at'), table_name='runs')
    op.drop_index(op.f('ix_runs_status'), table_name='runs')
    op.drop_index(op.f('ix_runs_user_id'), table_name='runs')
    op.drop_table('runs')
    
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')


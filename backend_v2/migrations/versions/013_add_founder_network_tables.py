"""add founder network tables

Revision ID: 013_add_founder_network_tables
Revises: 012_add_validations_table
Create Date: 2025-01-15
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '013_add_founder_network_tables'
down_revision = '012_add_validations_table'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create founder_profiles table
    op.create_table(
        'founder_profiles',
        sa.Column('id', postgresql.UUID(as_uuid=False), primary_key=True, nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=True),
        sa.Column('bio', sa.String(length=2000), nullable=True),
        sa.Column('location', sa.String(length=255), nullable=True),
        sa.Column('primary_skills', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('industries_of_interest', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('looking_for', sa.String(length=1000), nullable=True),
        sa.Column('commitment_level', sa.String(length=50), nullable=True),
        sa.Column('experience_summary', sa.String(length=5000), nullable=True),
        sa.Column('linkedin_url', sa.String(length=500), nullable=True),
        sa.Column('website_url', sa.String(length=500), nullable=True),
        sa.Column('is_public', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ondelete='CASCADE'),
    )
    op.create_index('idx_founder_profile_user_id', 'founder_profiles', ['user_id'], unique=True)
    op.create_index('idx_founder_profile_public', 'founder_profiles', ['is_public'], unique=False)

    # Create founder_idea_listings table
    op.create_table(
        'founder_idea_listings',
        sa.Column('id', postgresql.UUID(as_uuid=False), primary_key=True, nullable=False),
        sa.Column('profile_id', postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('brief_description', sa.String(length=2000), nullable=True),
        sa.Column('industry', sa.String(length=255), nullable=True),
        sa.Column('stage', sa.String(length=50), nullable=True),
        sa.Column('skills_needed', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('source_type', sa.String(length=50), nullable=True),
        sa.Column('source_id', sa.String(length=255), nullable=True),
        sa.Column('validation_score', sa.Float(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['profile_id'], ['founder_profiles.id'], ondelete='CASCADE'),
    )
    op.create_index('idx_idea_listing_profile', 'founder_idea_listings', ['profile_id'], unique=False)
    op.create_index('idx_idea_listing_active', 'founder_idea_listings', ['is_active'], unique=False)
    op.create_index('idx_idea_listing_source', 'founder_idea_listings', ['source_type', 'source_id'], unique=False)
    op.create_index('idx_idea_listing_industry_stage', 'founder_idea_listings', ['industry', 'stage'], unique=False)

    # Create founder_connections table
    op.create_table(
        'founder_connections',
        sa.Column('id', postgresql.UUID(as_uuid=False), primary_key=True, nullable=False),
        sa.Column('sender_id', postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column('recipient_id', postgresql.UUID(as_uuid=False), nullable=True),
        sa.Column('idea_listing_id', postgresql.UUID(as_uuid=False), nullable=True),
        sa.Column('connection_type', sa.String(length=50), nullable=False, server_default='profile'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='pending'),
        sa.Column('message', sa.String(length=1000), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('responded_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['sender_id'], ['founder_profiles.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['recipient_id'], ['founder_profiles.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['idea_listing_id'], ['founder_idea_listings.id'], ondelete='CASCADE'),
    )
    op.create_index('idx_connection_sender', 'founder_connections', ['sender_id'], unique=False)
    op.create_index('idx_connection_recipient', 'founder_connections', ['recipient_id'], unique=False)
    op.create_index('idx_connection_idea', 'founder_connections', ['idea_listing_id'], unique=False)
    op.create_index('idx_connection_status', 'founder_connections', ['status'], unique=False)
    op.create_index('idx_connection_type', 'founder_connections', ['connection_type'], unique=False)
    op.create_index('idx_connection_sender_recipient', 'founder_connections', ['sender_id', 'recipient_id', 'idea_listing_id'], unique=False)


def downgrade() -> None:
    op.drop_index('idx_connection_sender_recipient', table_name='founder_connections')
    op.drop_index('idx_connection_type', table_name='founder_connections')
    op.drop_index('idx_connection_status', table_name='founder_connections')
    op.drop_index('idx_connection_idea', table_name='founder_connections')
    op.drop_index('idx_connection_recipient', table_name='founder_connections')
    op.drop_index('idx_connection_sender', table_name='founder_connections')
    op.drop_table('founder_connections')
    
    op.drop_index('idx_idea_listing_industry_stage', table_name='founder_idea_listings')
    op.drop_index('idx_idea_listing_source', table_name='founder_idea_listings')
    op.drop_index('idx_idea_listing_active', table_name='founder_idea_listings')
    op.drop_index('idx_idea_listing_profile', table_name='founder_idea_listings')
    op.drop_table('founder_idea_listings')
    
    op.drop_index('idx_founder_profile_public', table_name='founder_profiles')
    op.drop_index('idx_founder_profile_user_id', table_name='founder_profiles')
    op.drop_table('founder_profiles')


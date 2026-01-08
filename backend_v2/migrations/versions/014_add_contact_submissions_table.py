"""add contact_submissions table

Revision ID: 014_add_contact_submissions
Revises: a8b9077d4af1
Create Date: 2025-01-20
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '014_add_contact_submissions'
down_revision = 'a8b9077d4af1'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create contact_submissions table
    op.create_table(
        'contact_submissions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('company', sa.String(length=255), nullable=True),
        sa.Column('topic', sa.String(length=255), nullable=True),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=50), server_default='new', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index(op.f('ix_contact_submissions_email'), 'contact_submissions', ['email'], unique=False)
    op.create_index(op.f('ix_contact_submissions_status'), 'contact_submissions', ['status'], unique=False)
    op.create_index(op.f('ix_contact_submissions_created_at'), 'contact_submissions', ['created_at'], unique=False)


def downgrade() -> None:
    # Drop indexes
    op.drop_index(op.f('ix_contact_submissions_created_at'), table_name='contact_submissions')
    op.drop_index(op.f('ix_contact_submissions_status'), table_name='contact_submissions')
    op.drop_index(op.f('ix_contact_submissions_email'), table_name='contact_submissions')
    
    # Drop table
    op.drop_table('contact_submissions')


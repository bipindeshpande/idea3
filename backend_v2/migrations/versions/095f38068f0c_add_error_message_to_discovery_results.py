"""add_error_message_to_discovery_results

Revision ID: 095f38068f0c
Revises: 002_add_discovery_results
Create Date: 2025-12-08 22:55:11.931048

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '095f38068f0c'
down_revision = '002_add_discovery_results'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add error_message column
    op.add_column('discovery_results', sa.Column('error_message', sa.String(length=500), nullable=True))
    
    # Update status default to 'pending' (for new records)
    op.alter_column('discovery_results', 'status',
                    existing_type=sa.String(length=50),
                    server_default='pending',
                    nullable=False)


def downgrade() -> None:
    # Remove error_message column
    op.drop_column('discovery_results', 'error_message')
    
    # Revert status default to 'completed'
    op.alter_column('discovery_results', 'status',
                    existing_type=sa.String(length=50),
                    server_default='completed',
                    nullable=False)


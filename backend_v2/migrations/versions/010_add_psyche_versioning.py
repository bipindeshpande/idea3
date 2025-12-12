"""Add versioning fields to psyche_profiles

Revision ID: 010_psyche_versioning
Revises: 009_psyche_profiles
Create Date: 2024-12-20 13:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '010_psyche_versioning'
down_revision = '009_psyche_profiles'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add versioning columns
    op.add_column('psyche_profiles', sa.Column('psyche_version', sa.String(length=10), nullable=True))
    op.add_column('psyche_profiles', sa.Column('computed_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column('psyche_profiles', 'computed_at')
    op.drop_column('psyche_profiles', 'psyche_version')


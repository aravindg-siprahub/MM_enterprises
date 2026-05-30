"""add_premium_product_fields

Revision ID: b8c77f346216
Revises: 99e53ed69e85
Create Date: 2026-05-28 23:24:49.634685

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b8c77f346216'
down_revision: Union[str, Sequence[str], None] = '99e53ed69e85'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


from sqlalchemy.dialects import postgresql

def upgrade() -> None:
    """Upgrade schema."""
    # Add new columns to products
    op.add_column('products', sa.Column('seo_text', sa.String(length=500), nullable=True))
    op.add_column('products', sa.Column('ai_summary', sa.Text(), nullable=True))
    op.add_column('products', sa.Column('specifications', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column('products', sa.Column('recommendations_metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True))

def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('products', 'recommendations_metadata')
    op.drop_column('products', 'specifications')
    op.drop_column('products', 'ai_summary')
    op.drop_column('products', 'seo_text')

"""add_missing_product_id_indexes

Revision ID: 3455e444d9c7
Revises: fbcb6ab21cb1
Create Date: 2026-06-07 18:29:13.680269

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3455e444d9c7'
down_revision: Union[str, Sequence[str], None] = 'fbcb6ab21cb1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_deals_product_id ON deals(product_id);
        CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
        CREATE INDEX IF NOT EXISTS idx_wishlist_items_product_id ON wishlist_items(product_id);
    """)


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("""
        DROP INDEX IF EXISTS idx_wishlist_items_product_id;
        DROP INDEX IF EXISTS idx_cart_items_product_id;
        DROP INDEX IF EXISTS idx_deals_product_id;
    """)

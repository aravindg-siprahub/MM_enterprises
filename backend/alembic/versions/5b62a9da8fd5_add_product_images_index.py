"""add_product_images_index

Revision ID: 5b62a9da8fd5
Revises: 5d8adabbee95
Create Date: 2026-05-30 18:12:51.015127

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5b62a9da8fd5'
down_revision: Union[str, Sequence[str], None] = '5d8adabbee95'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);")


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DROP INDEX IF EXISTS idx_product_images_product_id;")

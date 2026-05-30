"""Fix null slugs in products

Revision ID: 115626c27d77
Revises: 001
Create Date: 2026-05-28 13:09:32.239467

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '115626c27d77'
down_revision: Union[str, Sequence[str], None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("""
    UPDATE products SET slug = lower(regexp_replace(
      regexp_replace(name, '[^a-zA-Z0-9\s]', '', 'g'),
      '\s+', '-', 'g'
    )) WHERE slug IS NULL OR slug = '';
    """)


def downgrade() -> None:
    """Downgrade schema."""
    pass

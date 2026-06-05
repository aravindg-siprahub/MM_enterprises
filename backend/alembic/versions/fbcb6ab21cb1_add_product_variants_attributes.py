"""add_product_variants_attributes

Revision ID: fbcb6ab21cb1
Revises: 5b62a9da8fd5
Create Date: 2026-05-31 14:22:27.202206

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fbcb6ab21cb1'
down_revision: Union[str, Sequence[str], None] = '5b62a9da8fd5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute('''
        CREATE TABLE IF NOT EXISTS product_variants (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            product_id uuid REFERENCES products(id) ON DELETE CASCADE,
            variant_type varchar(50) NOT NULL,
            variant_value varchar(100) NOT NULL,
            sku varchar(100),
            price_override numeric(10,2),
            stock_quantity int DEFAULT 0,
            image_url text,
            is_default boolean DEFAULT false,
            is_active boolean DEFAULT true,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS product_attributes (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            product_id uuid REFERENCES products(id) ON DELETE CASCADE,
            attribute_name varchar(100) NOT NULL,
            attribute_value text NOT NULL,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now(),
            UNIQUE(product_id, attribute_name)
        );

        CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
        CREATE INDEX IF NOT EXISTS idx_product_variants_type ON product_variants(variant_type);
        CREATE INDEX IF NOT EXISTS idx_product_variants_active ON product_variants(is_active);
        CREATE INDEX IF NOT EXISTS idx_product_attributes_product_id ON product_attributes(product_id);
        
        ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
        ALTER TABLE product_attributes ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "public_read_product_variants" ON product_variants FOR SELECT USING (is_active = true);
        CREATE POLICY "admin_all_product_variants" ON product_variants FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true));
        
        CREATE POLICY "public_read_product_attributes" ON product_attributes FOR SELECT USING (true);
        CREATE POLICY "admin_all_product_attributes" ON product_attributes FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true));
    ''')


def downgrade() -> None:
    """Downgrade schema."""
    op.execute('''
        DROP TABLE IF EXISTS product_attributes;
        DROP TABLE IF EXISTS product_variants;
    ''')

"""add ecommerce tables

Revision ID: 99e53ed69e85
Revises: 115626c27d77
Create Date: 2026-05-28 16:43:18.017354

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '99e53ed69e85'
down_revision: Union[str, Sequence[str], None] = '115626c27d77'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY REFERENCES auth.users(id),
        email varchar(255) UNIQUE NOT NULL,
        full_name varchar(255),
        phone varchar(20),
        created_at timestamptz DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS carts (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES users(id) ON DELETE CASCADE,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS cart_items (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        cart_id uuid REFERENCES carts(id) ON DELETE CASCADE,
        product_id uuid REFERENCES products(id) ON DELETE CASCADE,
        quantity int DEFAULT 1,
        created_at timestamptz DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS wishlists (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES users(id) ON DELETE CASCADE,
        created_at timestamptz DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS wishlist_items (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        wishlist_id uuid REFERENCES wishlists(id) ON DELETE CASCADE,
        product_id uuid REFERENCES products(id) ON DELETE CASCADE,
        created_at timestamptz DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS reviews (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id uuid REFERENCES products(id) ON DELETE CASCADE,
        user_id uuid REFERENCES users(id) ON DELETE CASCADE,
        rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment text,
        is_approved boolean DEFAULT false,
        created_at timestamptz DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
    CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
    CREATE INDEX IF NOT EXISTS idx_wishlist_items_wishlist_id ON wishlist_items(wishlist_id);

    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
    ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
    ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
    ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
    ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "public_read_reviews" ON reviews FOR SELECT USING (is_approved = true);

    CREATE POLICY "users_read_own" ON users FOR SELECT USING (id = auth.uid());
    CREATE POLICY "users_update_own" ON users FOR UPDATE USING (id = auth.uid());

    CREATE POLICY "users_read_own_carts" ON carts FOR SELECT USING (user_id = auth.uid());
    CREATE POLICY "users_all_own_carts" ON carts FOR ALL USING (user_id = auth.uid());

    CREATE POLICY "users_all_own_cart_items" ON cart_items FOR ALL USING (
        EXISTS (SELECT 1 FROM carts WHERE id = cart_items.cart_id AND user_id = auth.uid())
    );

    CREATE POLICY "users_read_own_wishlists" ON wishlists FOR SELECT USING (user_id = auth.uid());
    CREATE POLICY "users_all_own_wishlists" ON wishlists FOR ALL USING (user_id = auth.uid());

    CREATE POLICY "users_all_own_wishlist_items" ON wishlist_items FOR ALL USING (
        EXISTS (SELECT 1 FROM wishlists WHERE id = wishlist_items.wishlist_id AND user_id = auth.uid())
    );

    CREATE POLICY "users_insert_reviews" ON reviews FOR INSERT WITH CHECK (user_id = auth.uid());
    """)


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("""
    DROP TABLE IF EXISTS reviews CASCADE;
    DROP TABLE IF EXISTS wishlist_items CASCADE;
    DROP TABLE IF EXISTS wishlists CASCADE;
    DROP TABLE IF EXISTS cart_items CASCADE;
    DROP TABLE IF EXISTS carts CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    """)

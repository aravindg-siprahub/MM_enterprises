"""initial_schema

Revision ID: 001
Revises: 
Create Date: 2026-05-27 23:05:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 0. Drop existing tables to ensure clean state
    op.execute("""
    DROP TABLE IF EXISTS admin_users CASCADE;
    DROP TABLE IF EXISTS deals CASCADE;
    DROP TABLE IF EXISTS banners CASCADE;
    DROP TABLE IF EXISTS product_images CASCADE;
    DROP TABLE IF EXISTS products CASCADE;
    DROP TABLE IF EXISTS brands CASCADE;
    DROP TABLE IF EXISTS categories CASCADE;
    """)

    # 1. Create Tables
    op.execute("""
    CREATE TABLE IF NOT EXISTS categories (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(100) NOT NULL,
        slug varchar(100) UNIQUE NOT NULL,
        icon_url text,
        parent_id uuid REFERENCES categories(id),
        is_active boolean DEFAULT true,
        sort_order int DEFAULT 0,
        created_at timestamptz DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS brands (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(100) NOT NULL,
        slug varchar(100) UNIQUE NOT NULL,
        logo_url text,
        is_active boolean DEFAULT true,
        created_at timestamptz DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS products (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(255) NOT NULL,
        slug varchar(255) UNIQUE NOT NULL,
        description text,
        category_id uuid REFERENCES categories(id),
        brand_id uuid REFERENCES brands(id),
        original_price numeric(10,2) NOT NULL,
        selling_price numeric(10,2) NOT NULL,
        discount_percent int GENERATED ALWAYS AS (ROUND(((original_price - selling_price) / original_price) * 100)) STORED,
        stock_qty int DEFAULT 0,
        warranty_info varchar(100),
        tags text[],
        is_active boolean DEFAULT true,
        is_featured boolean DEFAULT false,
        is_top_deal boolean DEFAULT false,
        rating numeric(2,1) DEFAULT 0.0,
        review_count int DEFAULT 0,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS product_images (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id uuid REFERENCES products(id) ON DELETE CASCADE,
        image_url text NOT NULL,
        alt_text varchar(255),
        is_primary boolean DEFAULT false,
        sort_order int DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS banners (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        title varchar(255),
        subtitle text,
        image_url text NOT NULL,
        cta_text varchar(100),
        cta_link varchar(255),
        badge_text varchar(50),
        placement varchar(50) NOT NULL,
        is_active boolean DEFAULT true,
        sort_order int DEFAULT 0,
        starts_at timestamptz,
        ends_at timestamptz,
        created_at timestamptz DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS deals (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id uuid REFERENCES products(id) ON DELETE CASCADE,
        deal_type varchar(50) NOT NULL,
        deal_price numeric(10,2),
        ends_at timestamptz,
        is_active boolean DEFAULT true,
        sort_order int DEFAULT 0,
        created_at timestamptz DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS admin_users (
        id uuid PRIMARY KEY REFERENCES auth.users(id),
        email varchar(255) UNIQUE NOT NULL,
        full_name varchar(255),
        role varchar(50) DEFAULT 'admin',
        is_active boolean DEFAULT true,
        created_at timestamptz DEFAULT now()
    );
    """)

    # 2. Create Indexes
    op.execute("""
    CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
    CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
    CREATE INDEX IF NOT EXISTS idx_products_active_featured ON products(is_active, is_featured);
    CREATE INDEX IF NOT EXISTS idx_products_active_topdeal ON products(is_active, is_top_deal);
    CREATE INDEX IF NOT EXISTS idx_banners_placement_active ON banners(placement, is_active);
    CREATE INDEX IF NOT EXISTS idx_deals_type_active ON deals(deal_type, is_active);
    """)

    # 3. Enable RLS
    op.execute("""
    ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
    ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
    ALTER TABLE products ENABLE ROW LEVEL SECURITY;
    ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
    ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
    ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
    ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
    """)

    # 4. RLS Policies
    op.execute("""
    -- Public read
    CREATE POLICY "public_read_products" ON products FOR SELECT USING (is_active = true);
    CREATE POLICY "public_read_banners" ON banners FOR SELECT USING (is_active = true);
    CREATE POLICY "public_read_categories" ON categories FOR SELECT USING (is_active = true);
    CREATE POLICY "public_read_brands" ON brands FOR SELECT USING (is_active = true);
    CREATE POLICY "public_read_deals" ON deals FOR SELECT USING (is_active = true);
    CREATE POLICY "public_read_product_images" ON product_images FOR SELECT USING (true);

    -- Admin full access
    CREATE POLICY "admin_all_products" ON products FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true));
    CREATE POLICY "admin_all_banners" ON banners FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true));
    CREATE POLICY "admin_all_categories" ON categories FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true));
    CREATE POLICY "admin_all_brands" ON brands FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true));
    CREATE POLICY "admin_all_deals" ON deals FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true));
    CREATE POLICY "admin_all_product_images" ON product_images FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true));
    CREATE POLICY "admin_all_admin_users" ON admin_users FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true));
    """)

    # 5. Supabase Storage Buckets
    op.execute("""
    -- Insert buckets
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES 
        ('products', 'products', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
        ('banners', 'banners', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
        ('brands', 'brands', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
        ('icons', 'icons', true, 1048576, ARRAY['image/png', 'image/svg+xml', 'image/webp'])
    ON CONFLICT (id) DO UPDATE SET 
        public = EXCLUDED.public,
        file_size_limit = EXCLUDED.file_size_limit,
        allowed_mime_types = EXCLUDED.allowed_mime_types;
    """)

    # 6. Storage RLS Policies
    op.execute("""
    -- Public read for buckets
    CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN ('products', 'banners', 'brands', 'icons'));
    
    -- Admin write for buckets
    CREATE POLICY "Admin Insert" ON storage.objects FOR INSERT WITH CHECK (
        bucket_id IN ('products', 'banners', 'brands', 'icons') AND 
        EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND is_active = true)
    );
    CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE USING (
        bucket_id IN ('products', 'banners', 'brands', 'icons') AND 
        EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND is_active = true)
    );
    CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING (
        bucket_id IN ('products', 'banners', 'brands', 'icons') AND 
        EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND is_active = true)
    );
    """)


def downgrade() -> None:
    # Reverse operations
    op.execute("""
    DROP POLICY IF EXISTS "Public Access" ON storage.objects;
    DROP POLICY IF EXISTS "Admin Insert" ON storage.objects;
    DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
    DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
    
    DELETE FROM storage.buckets WHERE id IN ('products', 'banners', 'brands', 'icons');
    """)

    op.execute("""
    DROP TABLE IF EXISTS admin_users CASCADE;
    DROP TABLE IF EXISTS deals CASCADE;
    DROP TABLE IF EXISTS banners CASCADE;
    DROP TABLE IF EXISTS product_images CASCADE;
    DROP TABLE IF EXISTS products CASCADE;
    DROP TABLE IF EXISTS brands CASCADE;
    DROP TABLE IF EXISTS categories CASCADE;
    """)

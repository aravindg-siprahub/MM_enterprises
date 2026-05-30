from fastapi import APIRouter, Depends
from app.database import get_db

router = APIRouter()

@router.get("/homepage")
def get_homepage(db: tuple = Depends(get_db)):
    conn, cursor = db
    
    # fetch_hero_banners
    cursor.execute("SELECT * FROM banners WHERE placement = %s AND is_active = true ORDER BY sort_order", ("hero",))
    hero_banners = cursor.fetchall()
        
    # fetch_mid_appliances
    cursor.execute("SELECT * FROM banners WHERE placement = %s AND is_active = true LIMIT 1", ("mid_appliances",))
    mid_appliances = cursor.fetchone()
        
    # fetch_mid_furniture
    cursor.execute("SELECT * FROM banners WHERE placement = %s AND is_active = true LIMIT 1", ("mid_furniture",))
    mid_furniture = cursor.fetchone()
        
    # fetch_top_deals (with products and product_images)
    cursor.execute("""
        SELECT d.*, 
            json_build_object(
                'id', p.id, 'name', p.name, 'slug', p.slug, 'original_price', p.original_price, 
                'selling_price', p.selling_price, 'discount_percent', p.discount_percent,
                'product_images', (SELECT json_agg(json_build_object('image_url', pi.image_url, 'is_primary', pi.is_primary)) FROM product_images pi WHERE pi.product_id = p.id)
            ) as products
        FROM deals d
        JOIN products p ON d.product_id = p.id
        WHERE d.deal_type = 'top_deal' AND d.is_active = true
        ORDER BY d.sort_order LIMIT 12
    """)
    top_deals = cursor.fetchall()

    # fetch_grab_or_gone
    cursor.execute("""
        SELECT d.*, 
            json_build_object(
                'id', p.id, 'name', p.name, 'slug', p.slug, 'original_price', p.original_price, 
                'selling_price', p.selling_price, 'discount_percent', p.discount_percent,
                'product_images', (SELECT json_agg(json_build_object('image_url', pi.image_url, 'is_primary', pi.is_primary)) FROM product_images pi WHERE pi.product_id = p.id)
            ) as products
        FROM deals d
        JOIN products p ON d.product_id = p.id
        WHERE d.deal_type = 'grab_or_gone' AND d.is_active = true
        LIMIT 10
    """)
    grab_or_gone = cursor.fetchall()

    # fetch_brand_spotlight
    cursor.execute("SELECT * FROM brands WHERE is_active = true ORDER BY created_at DESC LIMIT 12")
    brand_spotlight = cursor.fetchall()

    # fetch_appliances_featured
    cursor.execute("""
        SELECT p.*,
            (SELECT json_agg(json_build_object('image_url', pi.image_url, 'is_primary', pi.is_primary)) FROM product_images pi WHERE pi.product_id = p.id) as product_images,
            json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) as categories
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE c.slug = 'appliances' AND p.is_featured = true
        LIMIT 8
    """)
    appliances_featured = cursor.fetchall()

    # fetch_furniture_featured
    cursor.execute("""
        SELECT p.*,
            (SELECT json_agg(json_build_object('image_url', pi.image_url, 'is_primary', pi.is_primary)) FROM product_images pi WHERE pi.product_id = p.id) as product_images,
            json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) as categories
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE c.slug = 'furniture' AND p.is_featured = true
        LIMIT 8
    """)
    furniture_featured = cursor.fetchall()

    # fetch_categories
    cursor.execute("SELECT * FROM categories WHERE is_active = true ORDER BY sort_order")
    categories = cursor.fetchall()

    return {
        "hero_banners": hero_banners,
        "mid_banner_appliances": mid_appliances,
        "mid_banner_furniture": mid_furniture,
        "top_deals": top_deals,
        "grab_or_gone": grab_or_gone,
        "brand_spotlight": brand_spotlight,
        "appliances_featured": appliances_featured,
        "furniture_featured": furniture_featured,
        "categories": categories
    }

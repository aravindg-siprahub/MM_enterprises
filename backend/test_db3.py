import psycopg2
from app.config import settings
from urllib.parse import urlparse, urlunparse

parsed = urlparse(settings.DATABASE_URL)
clean_url = urlunparse(parsed._replace(query=''))
conn = psycopg2.connect(clean_url)
cur = conn.cursor()
query = """
    SELECT p.*,
        (SELECT json_agg(json_build_object('image_url', pi.image_url, 'is_primary', pi.is_primary)) FROM product_images pi WHERE pi.product_id = p.id) as product_images,
        json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) as categories
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE c.slug = 'mobiles' AND p.is_active = true
    ORDER BY p.created_at DESC
    LIMIT 10
"""
cur.execute(query)
print("LATEST MOBILES COUNT:", len(cur.fetchall()))

import sys
sys.path.append('c:\\Users\\Aravind\\Desktop\\MM_enterprises\\backend')
from app.database import db_pool
conn = db_pool.getconn()
try:
    with conn.cursor() as cur:
        # created_at
        cur.execute("CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);")
        # category (already had idx_products_category_id but creating specifically on slug in categories is good)
        # However categories_slug_key is already unique.
        
        # We query products where category_id = ... and is_active = true and ...
        # Let's add a composite index on category_id and created_at
        cur.execute("CREATE INDEX IF NOT EXISTS idx_products_category_created ON products(category_id, created_at DESC);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_products_brand_created ON products(brand_id, created_at DESC);")
        
    conn.commit()
    print("Indexes added successfully.")
finally:
    db_pool.putconn(conn)

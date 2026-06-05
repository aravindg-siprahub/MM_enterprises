import sys
import json
from psycopg2.extras import RealDictCursor
from app.database import db_pool

try:
    conn = db_pool.getconn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT id FROM products WHERE slug='iphone-15-pro-128gb'")
    product = cur.fetchone()
    if product:
        cur.execute("SELECT * FROM product_images WHERE product_id=%s ORDER BY sort_order", (product['id'],))
        images = cur.fetchall()
        print(f"Total images found: {len(images)}")
        for i, img in enumerate(images):
            img['id'] = str(img['id'])
            img['product_id'] = str(img['product_id'])
            print(f"Image {i+1}: {img}")
    else:
        print("Product not found")
finally:
    db_pool.putconn(conn)

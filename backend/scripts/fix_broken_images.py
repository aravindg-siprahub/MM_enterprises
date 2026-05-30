import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

def main():
    conn = psycopg2.connect(DATABASE_URL.replace("?sslmode=require", ""))
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Generic placeholders
    placeholders = {
        'mobiles': 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-pro-1.jpg',
        'appliances': 'https://www.lg.com/in/images/split-ac/md07542152/gallery/RS-Q19ENZE-Split-AC-Front-View-MZ-01.jpg',
        'furniture': 'https://www.durian.in/storage/product/800x800/1000x1000_1_1669894452.jpg'
    }

    try:
        cur.execute("""
            SELECT p.id, p.name, c.slug as category_slug 
            FROM products p 
            JOIN categories c ON p.category_id = c.id
        """)
        products = cur.fetchall()
        
        for p in products:
            cur.execute("SELECT image_url FROM product_images WHERE product_id = %s", (p['id'],))
            images = cur.fetchall()
            
            # Check if it has an unsplash image or no images
            needs_fix = False
            if not images:
                needs_fix = True
            else:
                for img in images:
                    if 'unsplash.com' in img['image_url']:
                        needs_fix = True
                        break
                        
            if needs_fix:
                cat_slug = p['category_slug']
                fallback = placeholders.get(cat_slug, placeholders['mobiles'])
                print(f"Fixing images for {p['name']} with fallback {fallback}")
                
                cur.execute("DELETE FROM product_images WHERE product_id = %s", (p['id'],))
                cur.execute("""
                    INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
                    VALUES (%s, %s, %s, %s)
                """, (p['id'], fallback, True, 0))
                
        conn.commit()
        print("All broken images fixed!")
    except Exception as e:
        conn.rollback()
        print("Error:", e)

if __name__ == "__main__":
    main()

import os
import sys
from dotenv import load_dotenv

# Add backend to path so app.database can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
load_dotenv()

from app.database import get_db

def test():
    db_gen = get_db()
    conn, cursor = next(db_gen)
    
    # Check Apple 17
    cursor.execute("SELECT id, name, slug, description FROM products WHERE name ILIKE '%Apple 17%'")
    apple = cursor.fetchall()
    print("Apple 17:", apple)
    
    # Check images for Apple 17
    if apple:
        cursor.execute("SELECT id, image_url FROM product_images WHERE product_id = %s", (apple[0]['id'],))
        images = cursor.fetchall()
        print("Apple 17 Images:", images)
        
    # Check a working product
    cursor.execute("SELECT id, name, slug, description FROM products LIMIT 1")
    working = cursor.fetchone()
    print("Working Product:", working)
    
    if working:
        cursor.execute("SELECT id, image_url FROM product_images WHERE product_id = %s", (working['id'],))
        images = cursor.fetchall()
        print("Working Product Images:", images)

if __name__ == "__main__":
    test()

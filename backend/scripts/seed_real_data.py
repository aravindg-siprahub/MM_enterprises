import os
import psycopg2
from dotenv import load_dotenv

load_dotenv('c:/Users/Aravind/Desktop/MM_enterprises/backend/.env')

conn = psycopg2.connect(os.environ['DATABASE_URL'])
cur = conn.cursor()

def seed_database():
    try:
        # Delete existing dummy data (deals, product_images, products)
        print("Clearing old products...")
        cur.execute("DELETE FROM deals;")
        cur.execute("DELETE FROM product_images;")
        cur.execute("DELETE FROM products;")
        conn.commit()

        # Get categories
        cur.execute("SELECT id, name FROM categories;")
        categories = {name: id for id, name in cur.fetchall()}
        
        # Ensure categories exist
        required_cats = ['Mobiles', 'Appliances', 'Furniture']
        for cat in required_cats:
            if cat not in categories:
                cur.execute("INSERT INTO categories (name, slug) VALUES (%s, %s) RETURNING id;", (cat, cat.lower()))
                categories[cat] = cur.fetchone()[0]
        
        # Get brands
        cur.execute("SELECT id, name FROM brands;")
        brands = {name: id for id, name in cur.fetchall()}
        
        required_brands = ['Apple', 'Samsung', 'LG', 'Sony', 'IKEA']
        for brand in required_brands:
            if brand not in brands:
                cur.execute("INSERT INTO brands (name, slug) VALUES (%s, %s) RETURNING id;", (brand, brand.lower()))
                brands[brand] = cur.fetchone()[0]

        products_data = [
            # Mobiles
            {
                "name": "Apple iPhone 15 Pro Max (Titanium, 256GB)",
                "slug": "apple-iphone-15-pro-max-titanium",
                "description": "Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.",
                "category": "Mobiles",
                "brand": "Apple",
                "original_price": 159900,
                "selling_price": 149900,
                "images": [
                    "https://images.unsplash.com/photo-1695048065095-2c8eb1c9255a?q=80&w=1000&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1695048132801-443b7b2512a1?q=80&w=1000&auto=format&fit=crop"
                ],
                "is_featured": True,
                "is_top_deal": True
            },
            {
                "name": "Samsung Galaxy S24 Ultra (Titanium Gray, 512GB)",
                "slug": "samsung-galaxy-s24-ultra-gray",
                "description": "Welcome to the era of mobile AI. With Galaxy S24 Ultra in your hands, you can unleash whole new levels of creativity, productivity and possibility.",
                "category": "Mobiles",
                "brand": "Samsung",
                "original_price": 139999,
                "selling_price": 129999,
                "images": [
                    "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=1000&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=1000&auto=format&fit=crop"
                ],
                "is_featured": True,
                "is_top_deal": False
            },
            
            # Appliances
            {
                "name": "LG 65 inch OLED 4K Smart TV",
                "slug": "lg-65-inch-oled-4k",
                "description": "Experience true immersion with LG OLED. Self-lit pixels create perfect black and infinite contrast, bringing out the darkest details.",
                "category": "Appliances",
                "brand": "LG",
                "original_price": 249990,
                "selling_price": 169990,
                "images": [
                    "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=1000&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=1000&auto=format&fit=crop"
                ],
                "is_featured": True,
                "is_top_deal": True
            },
            {
                "name": "Sony PlayStation 5 Console",
                "slug": "sony-playstation-5-console",
                "description": "The PS5 console unleashes new gaming possibilities that you never anticipated. Experience lightning-fast loading with an ultra-high speed SSD.",
                "category": "Appliances",
                "brand": "Sony",
                "original_price": 54990,
                "selling_price": 49990,
                "images": [
                    "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=1000&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=1000&auto=format&fit=crop"
                ],
                "is_featured": False,
                "is_top_deal": True
            },

            # Furniture
            {
                "name": "Premium Leather Sectional Sofa",
                "slug": "premium-leather-sectional-sofa",
                "description": "Crafted from top-grain Italian leather, this minimalist sectional sofa offers unparalleled comfort and modern aesthetics for your living room.",
                "category": "Furniture",
                "brand": "IKEA",
                "original_price": 85000,
                "selling_price": 75000,
                "images": [
                    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1000&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1000&auto=format&fit=crop"
                ],
                "is_featured": True,
                "is_top_deal": False
            },
            {
                "name": "Ergonomic Mesh Office Chair",
                "slug": "ergonomic-mesh-office-chair",
                "description": "Designed for maximum lumbar support, this breathable mesh chair ensures all-day comfort whether you're working or gaming.",
                "category": "Furniture",
                "brand": "IKEA",
                "original_price": 15000,
                "selling_price": 9999,
                "images": [
                    "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=1000&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=1000&auto=format&fit=crop"
                ],
                "is_featured": False,
                "is_top_deal": True
            }
        ]

        print("Inserting real products...")
        for p in products_data:
            cat_id = categories.get(p['category'])
            brand_id = brands.get(p['brand'])
            
            cur.execute("""
                INSERT INTO products (name, slug, description, category_id, brand_id, original_price, selling_price, stock_qty, is_featured, is_top_deal, rating, review_count)
                VALUES (%s, %s, %s, %s, %s, %s, %s, 50, %s, %s, 4.8, 120)
                RETURNING id;
            """, (p['name'], p['slug'], p['description'], cat_id, brand_id, p['original_price'], p['selling_price'], p['is_featured'], p['is_top_deal']))
            
            product_id = cur.fetchone()[0]
            
            # Insert images
            for idx, img in enumerate(p['images']):
                cur.execute("""
                    INSERT INTO product_images (product_id, image_url, sort_order, is_primary)
                    VALUES (%s, %s, %s, %s)
                """, (product_id, img, idx, idx == 0))
            
            # Insert deal if it's a top deal
            if p['is_top_deal']:
                cur.execute("""
                    INSERT INTO deals (product_id, deal_type, deal_price, ends_at)
                    VALUES (%s, 'top_deal', %s, NOW() + INTERVAL '7 days')
                """, (product_id, p['selling_price']))

        conn.commit()
        print("Database successfully seeded with realistic products!")

    except Exception as e:
        conn.rollback()
        print(f"Error seeding database: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    seed_database()

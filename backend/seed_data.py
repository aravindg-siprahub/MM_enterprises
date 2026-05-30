import psycopg2
import os
from dotenv import load_dotenv
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
from urllib.parse import urlparse, urlunparse

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL must be set in .env")

# Clean URL if it has unsupported params like pgbouncer
parsed = urlparse(DATABASE_URL)
clean_url = urlunparse(parsed._replace(query=""))

print("Connecting to database...")
conn = psycopg2.connect(clean_url)
conn.autocommit = False
cur = conn.cursor(cursor_factory=RealDictCursor)

try:
    print("=== SEEDING CATEGORIES ===")
    categories = [
        {"name": "For You", "slug": "for-you", "sort_order": 0, "is_active": True},
        {"name": "Mobiles", "slug": "mobiles", "sort_order": 1, "is_active": True},
        {"name": "Appliances", "slug": "appliances", "sort_order": 2, "is_active": True},
        {"name": "Furniture", "slug": "furniture", "sort_order": 3, "is_active": True}
    ]
    for cat in categories:
        cur.execute("""
            INSERT INTO categories (id, name, slug, sort_order, is_active)
            VALUES (gen_random_uuid(), %(name)s, %(slug)s, %(sort_order)s, %(is_active)s)
            ON CONFLICT (slug) DO UPDATE SET sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
            RETURNING id;
        """, cat)
        print(f"Upserted category: {cat['name']}")

    print("\n=== SEEDING BRANDS ===")
    brands = [
        # Mobiles
        {"name": "Apple", "logo": "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=100&q=80"},
        {"name": "Samsung", "logo": "https://images.unsplash.com/photo-1610945265064-3234dac15206?w=100&q=80"},
        {"name": "OnePlus", "logo": "https://images.unsplash.com/photo-1678911820864-e4c56891eb6a?w=100&q=80"},
        {"name": "Realme", "logo": "https://images.unsplash.com/photo-1628191010210-a59de33e5941?w=100&q=80"},
        {"name": "OPPO", "logo": "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=100&q=80"},
        {"name": "Vivo", "logo": "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=100&q=80"},
        {"name": "Motorola", "logo": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&q=80"},
        {"name": "Nothing", "logo": "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=100&q=80"},
        {"name": "Redmi", "logo": "https://images.unsplash.com/photo-1542496658-e328001fb177?w=100&q=80"},
        # Appliances
        {"name": "LG", "logo": "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=100&q=80"},
        {"name": "Haier", "logo": "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=100&q=80"},
        {"name": "Voltas", "logo": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&q=80"},
        {"name": "Godrej", "logo": "https://images.unsplash.com/photo-1581622558667-3419a8dc5f83?w=100&q=80"},
        {"name": "Whirlpool", "logo": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=100&q=80"},
        {"name": "IFB", "logo": "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=100&q=80"},
        {"name": "Midea", "logo": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=100&q=80"},
        # Furniture
        {"name": "Pepperfry", "logo": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&q=80"},
        {"name": "Durian", "logo": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&q=80"},
        {"name": "Nilkamal", "logo": "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=100&q=80"},
        {"name": "Wakefit", "logo": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=100&q=80"},
        {"name": "Sleepwell", "logo": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=100&q=80"},
        {"name": "Interio", "logo": "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=100&q=80"},
        {"name": "HomeTown", "logo": "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=100&q=80"}
    ]
    for b in brands:
        slug = b["name"].lower().replace(" ", "-")
        cur.execute("""
            INSERT INTO brands (id, name, slug, logo_url, is_active)
            VALUES (gen_random_uuid(), %s, %s, %s, true)
            ON CONFLICT (slug) DO UPDATE SET is_active = true, logo_url = EXCLUDED.logo_url
            RETURNING id;
        """, (b["name"], slug, b["logo"]))
        print(f"Upserted brand: {b['name']}")

    print("\n=== SEEDING BANNERS ===")
    # Clear old banners first
    cur.execute("DELETE FROM banners;")
    banners = [
        { "title":"Top Mobiles — Up to 40% Off", "subtitle":"Samsung, Apple, OnePlus — Best prices guaranteed", "cta_text":"Shop Mobiles", "cta_link":"/mobiles", "badge_text":"MEGA SALE", "image_url":"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1400&q=80", "placement":"hero", "sort_order":0, "is_active":True },
        { "title":"Home Appliances Sale", "subtitle":"AC, Fridge, Washing Machine — Unbeatable prices", "cta_text":"Explore Now", "cta_link":"/appliances", "badge_text":"UP TO 50% OFF", "image_url":"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80", "placement":"hero", "sort_order":1, "is_active":True },
        { "title":"Furniture for Every Home", "subtitle":"Sofas, Beds, Wardrobes — From ₹2,999", "cta_text":"Browse Furniture", "cta_link":"/furniture", "badge_text":"NEW ARRIVALS", "image_url":"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1400&q=80", "placement":"hero", "sort_order":2, "is_active":True },
        { "title":"iPhone 15 Pro — Now Available", "subtitle":"The most powerful iPhone ever. EMI from ₹3,499/month", "cta_text":"Buy Now", "cta_link":"/mobiles", "badge_text":"JUST LAUNCHED", "image_url":"https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80", "placement":"hero", "sort_order":3, "is_active":True },
        { "title":"Upgrade Your Kitchen", "subtitle":"Mixer Grinders, Microwaves, Air Fryers — From ₹999", "cta_text":"Shop Appliances →", "cta_link":"/appliances", "badge_text": None, "image_url":"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1400&q=80", "placement":"mid_appliances", "sort_order":0, "is_active":True },
        { "title":"Back to Campus Sale — Furniture", "subtitle":"Study tables, chairs, storage — Up to 60% off", "cta_text":"Shop Now →", "cta_link":"/furniture", "badge_text": None, "image_url":"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1400&q=80", "placement":"mid_furniture", "sort_order":0, "is_active":True }
    ]
    for b in banners:
        cur.execute("""
            INSERT INTO banners (id, title, subtitle, cta_text, cta_link, badge_text, image_url, placement, sort_order, is_active)
            VALUES (gen_random_uuid(), %(title)s, %(subtitle)s, %(cta_text)s, %(cta_link)s, %(badge_text)s, %(image_url)s, %(placement)s, %(sort_order)s, %(is_active)s)
        """, b)
        print(f"Inserted banner: {b['placement']} - {b['title']}")

    print("\n=== SEEDING PRODUCTS & DEALS ===")
    
    mobiles = [
      { "name":"Samsung Galaxy S24 5G", "brand_slug":"samsung", "original_price":79999, "selling_price":59999, "image":"https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80", "deal_type":"top_deal", "is_featured":True, "is_top_deal":True, "warranty_info":"1 Year Manufacturer Warranty", "tags":["5g","samsung","flagship"], "category_slug": "mobiles" },
      { "name":"iPhone 15 Pro 128GB", "brand_slug":"apple", "original_price":134900, "selling_price":119900, "image":"https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80", "deal_type":"top_deal", "is_featured":True, "is_top_deal":True, "warranty_info":"1 Year Apple Warranty", "tags":["iphone","apple","5g"], "category_slug": "mobiles" },
      { "name":"OnePlus 12R 8GB+128GB", "brand_slug":"oneplus", "original_price":44999, "selling_price":36999, "image":"https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80", "deal_type":"grab_or_gone", "is_featured":True, "is_top_deal": False, "warranty_info":"1 Year Warranty", "tags":["oneplus","5g","fast-charge"], "category_slug": "mobiles" },
      { "name":"Realme 12 Pro+ 5G", "brand_slug":"realme", "original_price":29999, "selling_price":22999, "image":"https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400&q=80", "deal_type":"top_deal", "is_featured":True, "is_top_deal":True, "warranty_info":"1 Year Warranty", "tags":["realme","5g"], "category_slug": "mobiles" },
      { "name":"OPPO Reno 11 Pro 5G", "brand_slug":"oppo", "original_price":34999, "selling_price":26999, "image":"https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&q=80", "deal_type":"grab_or_gone", "is_featured":False, "is_top_deal": False, "warranty_info":"1 Year Warranty", "tags":["oppo","5g","camera"], "category_slug": "mobiles" },
      { "name":"Vivo V30 Pro 5G", "brand_slug":"vivo", "original_price":39999, "selling_price":31999, "image":"https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&q=80", "deal_type":"top_deal", "is_featured":True, "is_top_deal":True, "warranty_info":"1 Year Warranty", "tags":["vivo","5g"], "category_slug": "mobiles" },
      { "name":"Motorola Edge 50 Fusion", "brand_slug":"motorola", "original_price":24999, "selling_price":18999, "image":"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80", "deal_type":"grab_or_gone", "is_featured":False, "is_top_deal": False, "warranty_info":"1 Year Warranty", "tags":["motorola","5g"], "category_slug": "mobiles" },
      { "name":"Redmi Note 13 Pro+ 5G", "brand_slug":"redmi", "original_price":33999, "selling_price":29999, "images":["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80", "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80"], "deal_type":"top_deal", "is_featured":True, "is_top_deal":True, "warranty_info":"1 Year Warranty", "tags":["redmi","5g"], "category_slug": "mobiles" },
      { "name":"Samsung Galaxy Z Fold 5", "brand_slug":"samsung", "original_price":164999, "selling_price":154999, "images":["https://images.unsplash.com/photo-1610945264803-c22b6272a54f?w=400&q=80"], "deal_type":"featured", "is_featured":True, "is_top_deal":False, "warranty_info":"1 Year Warranty", "tags":["samsung","foldable"], "category_slug": "mobiles" },
      { "name":"OnePlus Nord CE 3", "brand_slug":"oneplus", "original_price":26999, "selling_price":24999, "images":["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80"], "deal_type":"grab_or_gone", "is_featured":False, "is_top_deal":False, "warranty_info":"1 Year Warranty", "tags":["oneplus","nord"], "category_slug": "mobiles" },
      { "name":"Vivo X100 Pro", "brand_slug":"vivo", "original_price":89999, "selling_price":89999, "images":["https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&q=80"], "deal_type":"featured", "is_featured":True, "is_top_deal":False, "warranty_info":"1 Year Warranty", "tags":["vivo","camera"], "category_slug": "mobiles" },
      { "name":"OPPO Find N3 Flip", "brand_slug":"oppo", "original_price":94999, "selling_price":89999, "images":["https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&q=80"], "deal_type":"top_deal", "is_featured":True, "is_top_deal":True, "warranty_info":"1 Year Warranty", "tags":["oppo","flip"], "category_slug": "mobiles" }
    ]

    appliances = [
      { "name":"LG 1.5 Ton 5 Star Wi-Fi Inverter AC", "brand_slug":"lg", "original_price":52999, "selling_price":38999, "image":"https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80", "deal_type":"featured", "is_featured":True, "is_top_deal": False, "warranty_info":"5 Years Compressor Warranty", "tags":["ac","inverter","5star"], "category_slug": "appliances" },
      { "name":"Samsung 253L Double Door Fridge", "brand_slug":"samsung", "original_price":34999, "selling_price":26999, "image":"https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&q=80", "deal_type":"featured", "is_featured":True, "is_top_deal": False, "warranty_info":"1 Year Comprehensive, 10 Years Compressor", "tags":["fridge","samsung","double-door"], "category_slug": "appliances" },
      { "name":"Whirlpool 7kg Fully Automatic Washing Machine", "brand_slug":"whirlpool", "original_price":28999, "selling_price":21499, "image":"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80", "deal_type":"featured", "is_featured":True, "is_top_deal": False, "warranty_info":"2 Years Comprehensive", "tags":["washing-machine","whirlpool","fully-automatic"], "category_slug": "appliances" },
      { "name":"Voltas 1.5 Ton 3 Star Window AC", "brand_slug":"voltas", "original_price":32999, "selling_price":24999, "image":"https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80", "deal_type":"grab_or_gone", "is_featured":False, "is_top_deal": False, "warranty_info":"5 Years Compressor Warranty", "tags":["ac","voltas","window"], "category_slug": "appliances" },
      { "name":"LG 8kg Front Load Washing Machine", "brand_slug":"lg", "original_price":45999, "selling_price":34999, "images":["https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=400&q=80", "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80"], "deal_type":"top_deal", "is_featured":True, "is_top_deal": True, "warranty_info":"10 Years Motor Warranty", "tags":["lg","washing-machine"], "category_slug": "appliances" },
      { "name":"Haier 1.5 Ton 3 Star Inverter AC", "brand_slug":"haier", "original_price":42999, "selling_price":31999, "images":["https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&q=80"], "deal_type":"featured", "is_featured":True, "is_top_deal": False, "warranty_info":"5 Years Warranty", "tags":["haier","ac"], "category_slug": "appliances" },
      { "name":"Whirlpool 265L Frost Free Refrigerator", "brand_slug":"whirlpool", "original_price":28999, "selling_price":24999, "images":["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80"], "deal_type":"grab_or_gone", "is_featured":False, "is_top_deal": False, "warranty_info":"1 Year Warranty", "tags":["whirlpool","fridge"], "category_slug": "appliances" }
    ]

    furniture = [
      { "name":"Wakefit Orthopaedic Memory Foam Queen Mattress", "brand_slug":"wakefit", "original_price":18999, "selling_price":12999, "image":"https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80", "deal_type":"featured", "is_featured":True, "is_top_deal": False, "warranty_info":"7 Years Warranty", "tags":["mattress","wakefit","memory-foam"], "category_slug": "furniture" },
      { "name":"Durian Casper 3 Seater Sofa", "brand_slug":"durian", "original_price":35999, "selling_price":24999, "image":"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80", "deal_type":"featured", "is_featured":True, "is_top_deal": False, "warranty_info":"2 Years Warranty", "tags":["sofa","durian","3seater"], "category_slug": "furniture" }
    ]

    all_products = mobiles + appliances + furniture

    # Get cat_map and brand_map
    cur.execute("SELECT id, slug FROM categories")
    cat_map = {row['slug']: row['id'] for row in cur.fetchall()}
    
    cur.execute("SELECT id, slug FROM brands")
    brand_map = {row['slug']: row['id'] for row in cur.fetchall()}

    ends_at = datetime.now() + timedelta(days=30)

    for p in all_products:
        slug = p['name'].lower().replace(" ", "-").replace("+", "plus")
        
        cat_id = cat_map.get(p['category_slug'])
        brand_id = brand_map.get(p['brand_slug'])
        
        # Upsert product
        cur.execute("""
            INSERT INTO products (id, name, slug, category_id, brand_id, original_price, selling_price, warranty_info, tags, is_featured, is_top_deal)
            VALUES (gen_random_uuid(), %(name)s, %(slug)s, %(cat_id)s, %(brand_id)s, %(original_price)s, %(selling_price)s, %(warranty_info)s, %(tags)s, %(is_featured)s, %(is_top_deal)s)
            ON CONFLICT (slug) DO UPDATE SET 
                name = EXCLUDED.name,
                category_id = EXCLUDED.category_id,
                brand_id = EXCLUDED.brand_id,
                original_price = EXCLUDED.original_price,
                selling_price = EXCLUDED.selling_price,
                warranty_info = EXCLUDED.warranty_info,
                tags = EXCLUDED.tags,
                is_featured = EXCLUDED.is_featured,
                is_top_deal = EXCLUDED.is_top_deal
            RETURNING id
        """, {
            "name": p['name'], "slug": slug, "cat_id": cat_id, "brand_id": brand_id,
            "original_price": p['original_price'], "selling_price": p['selling_price'],
            "warranty_info": p['warranty_info'], "tags": p['tags'],
            "is_featured": p['is_featured'], "is_top_deal": p['is_top_deal']
        })
        
        product_id = cur.fetchone()['id']
        
        # Upsert image (clear existing first for simplicity)
        cur.execute("DELETE FROM product_images WHERE product_id = %s", (product_id,))
        images = p.get('images', [p.get('image')]) if p.get('images') or p.get('image') else []
        for i, img_url in enumerate(images):
            if not img_url: continue
            cur.execute("""
                INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
                VALUES (%s, %s, %s, %s)
            """, (product_id, img_url, i==0, i))

        # Upsert deal
        cur.execute("DELETE FROM deals WHERE product_id = %s", (product_id,))
        cur.execute("""
            INSERT INTO deals (product_id, deal_type, deal_price, ends_at)
            VALUES (%s, %s, %s, %s)
        """, (product_id, p['deal_type'], p['selling_price'], ends_at))
        
        print(f"Upserted product & deal: {p['name']}")

    conn.commit()
    print("\nDatabase Seeding Complete!")

except Exception as e:
    conn.rollback()
    print("Error occurred, rolling back!")
    import traceback
    traceback.print_exc()

finally:
    cur.close()
    conn.close()

import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv
from urllib.parse import urlparse, urlunparse

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL must be set in .env")

parsed = urlparse(DATABASE_URL)
clean_url = urlunparse(parsed._replace(query=""))

# Curated list of high-quality premium ecommerce images (using real, transparent or studio-lit device images)
PREMIUM_IMAGES = {
    "iphone-15-pro-128gb": [
        "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-pro-1.jpg",
        "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-pro-2.jpg",
        "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-pro-3.jpg"
    ],
    "samsung-galaxy-s24-5g": [
        "https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s24-5g-sm-s921-1.jpg",
        "https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s24-5g-sm-s921-2.jpg"
    ],
    "oneplus-12r-8gbplus128gb": [
        "https://fdn2.gsmarena.com/vv/pics/oneplus/oneplus-12r-1.jpg",
        "https://fdn2.gsmarena.com/vv/pics/oneplus/oneplus-12r-2.jpg"
    ],
    "realme-12-proplus-5g": [
        "https://fdn2.gsmarena.com/vv/pics/realme/realme-12-pro-plus-1.jpg"
    ],
    "oppo-reno-11-pro-5g": [
        "https://fdn2.gsmarena.com/vv/pics/oppo/oppo-reno11-pro-1.jpg"
    ],
    "vivo-v30-pro-5g": [
        "https://fdn2.gsmarena.com/vv/pics/vivo/vivo-v30-pro-1.jpg"
    ],
    "motorola-edge-50-fusion": [
        "https://fdn2.gsmarena.com/vv/pics/motorola/motorola-edge-50-fusion-1.jpg"
    ],
    "redmi-note-13-proplus-5g": [
        "https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-redmi-note-13-pro-plus-1.jpg",
        "https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-redmi-note-13-pro-plus-2.jpg"
    ],
    "samsung-galaxy-z-fold-5": [
        "https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-z-fold5-5g-1.jpg",
        "https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-z-fold5-5g-2.jpg"
    ],
    "oneplus-nord-ce-3": [
        "https://fdn2.gsmarena.com/vv/pics/oneplus/oneplus-nord-ce3-5g-1.jpg"
    ],
    "vivo-x100-pro": [
        "https://fdn2.gsmarena.com/vv/pics/vivo/vivo-x100-pro-1.jpg"
    ],
    "oppo-find-n3-flip": [
        "https://fdn2.gsmarena.com/vv/pics/oppo/oppo-find-n3-flip-1.jpg"
    ],
    # Appliances
    "lg-1.5-ton-5-star-wi-fi-inverter-ac": [
        "https://www.lg.com/in/images/split-ac/md07542152/gallery/RS-Q19ENZE-Split-AC-Front-View-MZ-01.jpg"
    ],
    "samsung-253l-double-door-fridge": [
        "https://images.samsung.com/is/image/samsung/in-double-door-rt28t3743s8-rt28t3743s8-hl-frontsilver-231922767?$684_547_PNG$"
    ],
    "whirlpool-7kg-fully-automatic-washing-machine": [
        "https://whirlpoolindia.vtexassets.com/arquivos/ids/162816-1200-1200?v=638069695627230000&width=1200&height=1200&aspect=true"
    ],
    "voltas-1.5-ton-3-star-window-ac": [
        "https://d3juy0z6sbe84.cloudfront.net/voltas/wp-content/uploads/2021/04/183V-CZP-Main.png"
    ],
    "lg-8kg-front-load-washing-machine": [
        "https://www.lg.com/in/images/washing-machines/md07525381/gallery/FHM1408BDL-Washing-Machines-Front-View-MZ-01.jpg"
    ],
    "haier-1.5-ton-3-star-inverter-ac": [
        "https://www.haier.com/in/air-conditioners/hsu18k-pyfr3ben-inv/386c9e013233f2182fc600c3298a033f_186634.png"
    ],
    "whirlpool-265l-frost-free-refrigerator": [
        "https://whirlpoolindia.vtexassets.com/arquivos/ids/161474-1200-1200?v=638069670005730000&width=1200&height=1200&aspect=true"
    ],
    # Furniture
    "wakefit-orthopaedic-memory-foam-queen-mattress": [
        "https://www.wakefit.co/cdn/shop/files/Orthopedic_Memory_Foam_Mattress_2.jpg?v=1686737521&width=600"
    ],
    "durian-casper-3-seater-sofa": [
        "https://www.durian.in/storage/product/800x800/1000x1000_1_1669894452.jpg"
    ]
}

def main():
    conn = psycopg2.connect(clean_url)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute("SELECT id, slug, name FROM products")
        products = cur.fetchall()
        
        for p in products:
            slug = p['slug']
            if slug in PREMIUM_IMAGES:
                images = PREMIUM_IMAGES[slug]
                print(f"Updating images for {p['name']}...")
                
                # Clear old images
                cur.execute("DELETE FROM product_images WHERE product_id = %s", (p['id'],))
                
                # Insert new images
                for i, img_url in enumerate(images):
                    cur.execute("""
                        INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
                        VALUES (%s, %s, %s, %s)
                    """, (p['id'], img_url, i==0, i))
            else:
                print(f"WARNING: No premium image mapping for {p['name']} ({slug})")
                
        conn.commit()
        print("Successfully seeded premium images!")
        
    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    main()

import os
import requests
import psycopg2
from psycopg2.extras import RealDictCursor
from urllib.parse import urlparse, urlunparse
import uuid
import mimetypes

SUPABASE_URL = "https://rvgbmufelqtcthjhfmii.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2Z2JtdWZlbHF0Y3RoamhmbWlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTc5NjUwMiwiZXhwIjoyMDk1MzcyNTAyfQ.GXjYk7mXJge1sUBu00d9H_VGpiy80bFq7eI4rlP1Cbo"
BUCKET_NAME = "mm-enterprises-images"

from dotenv import load_dotenv
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("Missing DATABASE_URL")
    exit(1)

parsed = urlparse(DATABASE_URL)
clean_url = urlunparse(parsed._replace(query=""))

def ensure_bucket():
    print("Checking/creating bucket...")
    headers = {
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "apikey": SUPABASE_KEY,
        "Content-Type": "application/json"
    }
    # Create bucket (if exists, it might return 400 but that's fine)
    res = requests.post(f"{SUPABASE_URL}/storage/v1/bucket", headers=headers, json={
        "id": BUCKET_NAME,
        "name": BUCKET_NAME,
        "public": True
    })
    if res.status_code in [200, 400]:
        print("Bucket is ready.")
    else:
        print("Error creating bucket:", res.text)
        
def upload_image_from_url(url):
    print(f"Downloading {url}...")
    try:
        r = requests.get(url, timeout=10)
        if r.status_code != 200:
            print(f"Failed to download {url}")
            return None
            
        content_type = r.headers.get('content-type', 'image/jpeg')
        ext = mimetypes.guess_extension(content_type) or '.jpg'
        filename = f"{uuid.uuid4()}{ext}"
        
        print(f"Uploading as {filename}...")
        headers = {
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "apikey": SUPABASE_KEY,
            "Content-Type": content_type
        }
        upload_res = requests.post(f"{SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}/{filename}", headers=headers, data=r.content)
        
        if upload_res.status_code == 200:
            public_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{filename}"
            return public_url
        else:
            print(f"Failed to upload: {upload_res.text}")
            return None
    except Exception as e:
        print(f"Error processing {url}: {e}")
        return None

def main():
    ensure_bucket()
    conn = psycopg2.connect(clean_url)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # 1. Update Brands
    cur.execute("SELECT id, logo_url FROM brands WHERE logo_url LIKE '%unsplash.com%'")
    brands = cur.fetchall()
    for b in brands:
        new_url = upload_image_from_url(b['logo_url'])
        if new_url:
            cur.execute("UPDATE brands SET logo_url = %s WHERE id = %s", (new_url, b['id']))
            print(f"Updated brand {b['id']} logo")
            
    # 2. Update Banners
    cur.execute("SELECT id, image_url FROM banners WHERE image_url LIKE '%unsplash.com%'")
    banners = cur.fetchall()
    for b in banners:
        new_url = upload_image_from_url(b['image_url'])
        if new_url:
            cur.execute("UPDATE banners SET image_url = %s WHERE id = %s", (new_url, b['id']))
            print(f"Updated banner {b['id']} image")
            
    # 3. Update Product Images
    cur.execute("SELECT id, image_url FROM product_images WHERE image_url LIKE '%unsplash.com%'")
    product_images = cur.fetchall()
    for img in product_images:
        new_url = upload_image_from_url(img['image_url'])
        if new_url:
            cur.execute("UPDATE product_images SET image_url = %s WHERE id = %s", (new_url, img['id']))
            print(f"Updated product_image {img['id']}")
            
    conn.commit()
    cur.close()
    conn.close()
    print("Migration complete!")

if __name__ == "__main__":
    main()

import os
import sys
import requests
import psycopg2
from psycopg2.extras import RealDictCursor
from urllib.parse import urlparse, urlunparse
import uuid
import mimetypes
from dotenv import load_dotenv
import time

# Force UTF-8 output on Windows
sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

SUPABASE_URL = "https://rvgbmufelqtcthjhfmii.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2Z2JtdWZlbHF0Y3RoamhmbWlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTc5NjUwMiwiZXhwIjoyMDk1MzcyNTAyfQ.GXjYk7mXJge1sUBu00d9H_VGpiy80bFq7eI4rlP1Cbo"
BUCKET_NAME = "mm-enterprises-images"

# A generic placeholder image to use for broken product images
PLACEHOLDER = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80" # Headphones (generic electronics)

def upload_image(image_url: str) -> str | None:
    """Download image and upload to Supabase. Returns public URL or None."""
    print(f"    Downloading replacement: {image_url}")
    try:
        r = requests.get(image_url, timeout=15)
        if r.status_code != 200:
            print(f"    ✗ Download failed ({r.status_code}).")
            return None

        content_type = r.headers.get('content-type', 'image/jpeg')
        ext = mimetypes.guess_extension(content_type) or '.jpg'
        filename = f"fixed_{uuid.uuid4()}{ext}"

        headers = {
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "apikey": SUPABASE_KEY,
            "Content-Type": content_type
        }
        upload_res = requests.post(
            f"{SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}/{filename}",
            headers=headers,
            data=r.content
        )
        if upload_res.status_code == 200:
            public_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{filename}"
            print(f"    ✓ Uploaded to Supabase: {public_url}")
            return public_url
        else:
            print(f"    ✗ Upload failed: {upload_res.text}")
            return None
    except Exception as e:
        print(f"    ✗ Error: {e}")
        return None

def is_url_broken(url: str) -> bool:
    if "supabase.co" in url:
        return False # Trust supabase URLs
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
    try:
        # First try HEAD
        r = requests.head(url, headers=headers, timeout=5)
        if r.status_code in (404, 403, 400, 500, 502, 503):
            # Sometimes HEAD is blocked, try GET
            rg = requests.get(url, headers=headers, stream=True, timeout=5)
            if rg.status_code != 200:
                return True
        elif r.status_code != 200:
             rg = requests.get(url, headers=headers, stream=True, timeout=5)
             if rg.status_code != 200:
                return True
        return False
    except Exception:
        return True # Timeout or DNS error = broken

def fix_table(cur, table, url_col):
    print(f"\nScanning table: {table}")
    cur.execute(f"SELECT id, {url_col} FROM {table} WHERE {url_col} IS NOT NULL")
    rows = cur.fetchall()
    
    for row in rows:
        url = row[url_col]
        print(f"  Checking [{row['id']}]: {url}")
        
        if is_url_broken(url):
            print(f"  ❌ Broken URL found! Fixing...")
            new_url = upload_image(PLACEHOLDER)
            if new_url:
                cur.execute(f"UPDATE {table} SET {url_col} = %s WHERE id = %s", (new_url, row['id']))
                print(f"  ✓ Updated {table} {row['id']}")
            else:
                print("  ! Failed to upload replacement.")
        else:
            print(f"  ✓ URL is good.")

def main():
    parsed = urlparse(DATABASE_URL)
    clean_url = urlunparse(parsed._replace(query=""))
    conn = psycopg2.connect(clean_url)
    cur = conn.cursor(cursor_factory=RealDictCursor)

    fix_table(cur, "product_images", "image_url")
    fix_table(cur, "brands", "logo_url")
    fix_table(cur, "banners", "image_url")
    fix_table(cur, "categories", "image_url")

    conn.commit()
    cur.close()
    conn.close()
    print("\n✅ Done! All broken images replaced and saved to Supabase.")

if __name__ == "__main__":
    main()

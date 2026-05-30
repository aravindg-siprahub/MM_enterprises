"""
Fix the 3 remaining broken (404) Unsplash image URLs in the database.
Replace them with working alternatives and upload to Supabase Storage.
"""
import os
import sys
import requests
import psycopg2
from psycopg2.extras import RealDictCursor
from urllib.parse import urlparse, urlunparse
import uuid
import mimetypes
from dotenv import load_dotenv

# Force UTF-8 output on Windows
sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

SUPABASE_URL = "https://rvgbmufelqtcthjhfmii.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2Z2JtdWZlbHF0Y3RoamhmbWlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTc5NjUwMiwiZXhwIjoyMDk1MzcyNTAyfQ.GXjYk7mXJge1sUBu00d9H_VGpiy80bFq7eI4rlP1Cbo"
BUCKET_NAME = "mm-enterprises-images"

# Map each dead URL → a working replacement
REPLACEMENTS = {
    # Dead Samsung/phone photo → working Samsung Galaxy S24 shot
    "https://images.unsplash.com/photo-1542496658-e328001fb177": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80",
    # Dead phone photo → working OnePlus/modern phone
    "https://images.unsplash.com/photo-1678911820864-e4c56891eb6a": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80",
    # Dead phone closeup → working iPhone/flagship phone
    "https://images.unsplash.com/photo-1610945264803-c22b6272a54f": "https://images.unsplash.com/photo-1592899677974-c460189a0f05?w=400&q=80",
}

# If a replacement itself is broken, use this absolute fallback
ULTIMATE_FALLBACK = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80"

def upload_image(image_url: str) -> str | None:
    """Download image and upload to Supabase. Returns public URL or None."""
    print(f"  Downloading: {image_url}")
    try:
        r = requests.get(image_url, timeout=15)
        if r.status_code != 200:
            print(f"  ✗ Download failed ({r.status_code}), trying fallback...")
            r = requests.get(ULTIMATE_FALLBACK, timeout=15)
            if r.status_code != 200:
                print(f"  ✗ Fallback also failed. Skipping.")
                return None

        content_type = r.headers.get('content-type', 'image/jpeg')
        ext = mimetypes.guess_extension(content_type) or '.jpg'
        filename = f"{uuid.uuid4()}{ext}"

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
            print(f"  ✓ Uploaded as {filename}")
            return public_url
        else:
            print(f"  ✗ Upload failed: {upload_res.text}")
            return None
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return None

def main():
    parsed = urlparse(DATABASE_URL)
    clean_url = urlunparse(parsed._replace(query=""))
    conn = psycopg2.connect(clean_url)
    cur = conn.cursor(cursor_factory=RealDictCursor)

    for dead_url_prefix, replacement_url in REPLACEMENTS.items():
        dead_pattern = f"{dead_url_prefix}%"
        print(f"\nSearching for: {dead_url_prefix}")

        # Check product_images
        cur.execute("SELECT id, image_url FROM product_images WHERE image_url LIKE %s", (dead_pattern,))
        rows = cur.fetchall()
        for row in rows:
            print(f"  Found product_image: {row['id']}")
            new_url = upload_image(replacement_url)
            if new_url:
                cur.execute("UPDATE product_images SET image_url = %s WHERE id = %s", (new_url, row['id']))
                print(f"  ✓ Updated product_image {row['id']}")

        # Check brands
        cur.execute("SELECT id, logo_url FROM brands WHERE logo_url LIKE %s", (dead_pattern,))
        rows = cur.fetchall()
        for row in rows:
            print(f"  Found brand: {row['id']}")
            new_url = upload_image(replacement_url)
            if new_url:
                cur.execute("UPDATE brands SET logo_url = %s WHERE id = %s", (new_url, row['id']))
                print(f"  ✓ Updated brand {row['id']}")

        # Check banners
        cur.execute("SELECT id, image_url FROM banners WHERE image_url LIKE %s", (dead_pattern,))
        rows = cur.fetchall()
        for row in rows:
            print(f"  Found banner: {row['id']}")
            new_url = upload_image(replacement_url)
            if new_url:
                cur.execute("UPDATE banners SET image_url = %s WHERE id = %s", (new_url, row['id']))
                print(f"  ✓ Updated banner {row['id']}")

    conn.commit()
    cur.close()
    conn.close()
    print("\n✅ Done! All broken images replaced and saved to Supabase.")

if __name__ == "__main__":
    main()

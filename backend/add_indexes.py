import psycopg2
import os
import urllib.parse
from dotenv import load_dotenv

load_dotenv()
db = os.getenv('DATABASE_URL')
p = urllib.parse.urlparse(db)
c = psycopg2.connect(urllib.parse.urlunparse(p._replace(query='')))
c.autocommit = True  # Required for CREATE INDEX CONCURRENTLY
cur = c.cursor()

indexes = [
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);",
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deals_product_id ON deals(product_id);"
]

for idx in indexes:
    try:
        cur.execute(idx)
        print(f"Successfully executed: {idx}")
    except Exception as e:
        print(f"Error on {idx}: {e}")

try:
    cur.execute("CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);")
    print("Successfully executed reviews index")
except Exception as e:
    print(f"Error on reviews index (table might not exist): {e}")

cur.close()
c.close()

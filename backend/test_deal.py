import os
import psycopg2
from dotenv import load_dotenv

load_dotenv(r"c:\Users\Aravind\Desktop\MM_enterprises\backend\.env")
conn = psycopg2.connect(os.getenv("DATABASE_URL"))
cursor = conn.cursor()

try:
    cursor.execute("SELECT id FROM products LIMIT 1")
    pid = cursor.fetchone()[0]
    print(f"Product ID: {pid}")

    cursor.execute("INSERT INTO deals (product_id, deal_type, deal_price, is_active, sort_order) VALUES (%s, %s, %s, %s, %s) RETURNING *", (pid, 'test', 10, True, 0))
    print(cursor.fetchone())
    conn.rollback()
except Exception as e:
    print(f"Error: {e}")

import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

try:
    conn = psycopg2.connect(DATABASE_URL.replace("?sslmode=require", ""))
    cur = conn.cursor()
    cur.execute("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'reviews'
    """)
    print("Columns:", cur.fetchall())
    print("Success:", cur.fetchone())
except Exception as e:
    print("Error:", e)

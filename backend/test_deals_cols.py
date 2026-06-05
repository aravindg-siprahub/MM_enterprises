import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv(r"c:\Users\Aravind\Desktop\MM_enterprises\backend\.env")
conn = psycopg2.connect(os.getenv("DATABASE_URL"))
cursor = conn.cursor(cursor_factory=RealDictCursor)

cursor.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'deals'")
print(cursor.fetchall())

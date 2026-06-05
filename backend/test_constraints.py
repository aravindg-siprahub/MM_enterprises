import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv(r"c:\Users\Aravind\Desktop\MM_enterprises\backend\.env")
conn = psycopg2.connect(os.getenv("DATABASE_URL"))
cursor = conn.cursor(cursor_factory=RealDictCursor)

cursor.execute("SELECT conname, pg_get_constraintdef(c.oid) FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace WHERE conrelid = 'deals'::regclass")
print(cursor.fetchall())

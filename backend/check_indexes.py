import sys
sys.path.append('c:\\Users\\Aravind\\Desktop\\MM_enterprises\\backend')
from app.database import db_pool
conn = db_pool.getconn()
try:
    with conn.cursor() as cur:
        cur.execute("""
            SELECT tablename, indexname, indexdef
            FROM pg_indexes
            WHERE schemaname = 'public'
            ORDER BY tablename, indexname;
        """)
        rows = cur.fetchall()
        for r in rows:
            print(f"{r[0]} | {r[1]} | {r[2]}")
finally:
    db_pool.putconn(conn)

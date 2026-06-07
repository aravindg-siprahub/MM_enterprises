import sys
sys.path.append('c:\\Users\\Aravind\\Desktop\\MM_enterprises\\backend')
from app.database import db_pool
from psycopg2.extras import RealDictCursor

conn = db_pool.getconn()
try:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT p.id, p.name, p.created_at
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE c.slug = 'mobiles' AND p.is_active = true
            ORDER BY p.created_at DESC
            LIMIT 10
        """)
        rows = cur.fetchall()
        for r in rows:
            print(f"{r['name']} - {r['created_at']}")
finally:
    db_pool.putconn(conn)

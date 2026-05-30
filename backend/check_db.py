import traceback
from app.database import db_pool

conn = None
try:
    conn = db_pool.getconn()
    cur = conn.cursor()
    cur.execute('SELECT 1')
    res = cur.fetchone()
    print('Connection successful: ' + str(list(res.values())[0]))
except Exception as e:
    print('Connection failed:')
    traceback.print_exc()
finally:
    if conn:
        db_pool.putconn(conn)

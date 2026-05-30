import psycopg2
from psycopg2.pool import SimpleConnectionPool
from psycopg2.extras import RealDictCursor
from app.config import settings
from urllib.parse import urlparse, urlunparse

if not settings.DATABASE_URL:
    raise ValueError("DATABASE_URL must be set")

# Parse URL to remove unsupported query parameters like pgbouncer=true
parsed = urlparse(settings.DATABASE_URL)
clean_url = urlunparse(parsed._replace(query=""))

# Initialize connection pool
db_pool = SimpleConnectionPool(
    minconn=1,
    maxconn=10,
    dsn=clean_url
)


def get_db():
    retries = 3
    conn = None
    for _ in range(retries):
        try:
            conn = db_pool.getconn()
            # Test if the connection is still alive
            with conn.cursor() as c:
                c.execute("SELECT 1")
            break  # Connection is good
        except psycopg2.OperationalError:
            # Server closed the connection or it timed out
            if conn:
                db_pool.putconn(conn, close=True)
            conn = None

    if not conn:
        raise Exception("Failed to acquire a valid database connection after retries")

    try:
        # Use RealDictCursor to return rows as dictionaries
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            yield conn, cursor
            conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        # Return the connection to the pool
        db_pool.putconn(conn)

def insert_record(cursor, table: str, data: dict):
    keys = list(data.keys())
    values = list(data.values())
    columns = ", ".join(keys)
    placeholders = ", ".join(["%s"] * len(keys))
    query = f"INSERT INTO {table} ({columns}) VALUES ({placeholders}) RETURNING *"
    cursor.execute(query, values)
    return cursor.fetchone()

def update_record(cursor, table: str, record_id: str, data: dict):
    if not data:
        return None
    keys = list(data.keys())
    values = list(data.values())
    set_clause = ", ".join([f"{k} = %s" for k in keys])
    values.append(record_id)
    query = f"UPDATE {table} SET {set_clause} WHERE id = %s RETURNING *"
    cursor.execute(query, values)
    return cursor.fetchone()

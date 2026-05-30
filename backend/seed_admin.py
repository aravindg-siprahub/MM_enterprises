"""
Seed script: Create admin user in Supabase
Email:    aravind.guggilla@gmail.com
Password: AIengineer@9915
"""

import psycopg2
from psycopg2.extras import RealDictCursor
from passlib.context import CryptContext
from urllib.parse import urlparse, urlunparse
import uuid
import os
from dotenv import load_dotenv

load_dotenv()

ADMIN_EMAIL    = "aravind.guggilla@gmail.com"
ADMIN_PASSWORD = "AIengineer@9915"
ADMIN_NAME     = "Aravind Guggilla"

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not set in .env")

parsed    = urlparse(DATABASE_URL)
clean_url = urlunparse(parsed._replace(query=""))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

print("Connecting to database...")
conn = psycopg2.connect(clean_url)
conn.autocommit = False
cur  = conn.cursor(cursor_factory=RealDictCursor)

try:
    # ── 1. Check if user already exists in auth.users ──────────────────────────
    cur.execute("SELECT id, email FROM auth.users WHERE email = %s", (ADMIN_EMAIL,))
    existing = cur.fetchone()

    if existing:
        admin_id = existing["id"]
        print(f"[OK] auth.users: found existing user  id={admin_id}")

        # Update password hash
        hashed = pwd_context.hash(ADMIN_PASSWORD)
        cur.execute(
            "UPDATE auth.users SET encrypted_password = %s, updated_at = NOW() WHERE id = %s",
            (hashed, admin_id),
        )
        print("[OK] auth.users: password hash updated")
    else:
        # Create new auth user
        admin_id = str(uuid.uuid4())
        hashed   = pwd_context.hash(ADMIN_PASSWORD)
        cur.execute(
            """
            INSERT INTO auth.users
                (id, email, encrypted_password, email_confirmed_at,
                 created_at, updated_at,
                 raw_app_meta_data, raw_user_meta_data,
                 aud, role)
            VALUES
                (%s, %s, %s, NOW(), NOW(), NOW(),
                 '{"provider":"email","providers":["email"]}',
                 %s,
                 'authenticated', 'authenticated')
            """,
            (admin_id, ADMIN_EMAIL, hashed, f'{{"full_name":"{ADMIN_NAME}"}}'),
        )
        print(f"[OK] auth.users: created new user  id={admin_id}")

    # 2. Upsert into admin_users
    cur.execute(
        """
        INSERT INTO admin_users (id, email, full_name, role, is_active)
        VALUES (%s, %s, %s, 'admin', true)
        ON CONFLICT (id) DO UPDATE
            SET email     = EXCLUDED.email,
                full_name = EXCLUDED.full_name,
                role      = 'admin',
                is_active = true
        """,
        (admin_id, ADMIN_EMAIL, ADMIN_NAME),
    )
    print("[OK] admin_users: upserted admin record")

    conn.commit()
    print()
    print("=" * 50)
    print("Admin credentials seeded successfully!")
    print(f"  Email   : {ADMIN_EMAIL}")
    print(f"  Password: {ADMIN_PASSWORD}")
    print("=" * 50)

except Exception as e:
    conn.rollback()
    print(f"[ERROR] {e}")
    import traceback
    traceback.print_exc()
finally:
    cur.close()
    conn.close()

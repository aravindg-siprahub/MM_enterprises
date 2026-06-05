import os
import requests
from dotenv import load_dotenv
from fastapi.testclient import TestClient
from app.main import app
from app.auth import get_current_admin
import psycopg2
from psycopg2.extras import RealDictCursor

load_dotenv(r"c:\Users\Aravind\Desktop\MM_enterprises\backend\.env")
app.dependency_overrides[get_current_admin] = lambda: {"id": "123", "role": "admin"}
client = TestClient(app)

conn = psycopg2.connect(os.getenv("DATABASE_URL"))
cursor = conn.cursor(cursor_factory=RealDictCursor)
cursor.execute("SELECT id FROM products LIMIT 1")
pid = cursor.fetchone()["id"]

# Scenario 1: Empty deal_price -> sent as null by JSON.stringify(NaN)
payload1 = {
    "product_id": str(pid),
    "deal_type": "top_deal",
    "deal_price": None,
    "is_active": True
}
print("Test 1 (null price):", client.post("/api/admin/deals", json=payload1).status_code)

# Scenario 2: deal_price is 0
payload2 = {
    "product_id": str(pid),
    "deal_type": "top_deal",
    "deal_price": 0,
    "is_active": True
}
print("Test 2 (0 price):", client.post("/api/admin/deals", json=payload2).status_code)

# Scenario 3: extra field?
payload3 = {
    "product_id": str(pid),
    "deal_type": "top_deal",
    "deal_price": 50000,
    "is_active": True,
    "product": {"id": "foo"}
}
print("Test 3 (extra field):", client.post("/api/admin/deals", json=payload3).status_code)


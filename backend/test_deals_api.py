import os
import requests
from dotenv import load_dotenv

load_dotenv(r"c:\Users\Aravind\Desktop\MM_enterprises\backend\.env")

# We will try to bypass token by directly calling the router function using FastAPI TestClient?
# Yes, we can just write a script to use FastAPI TestClient
from fastapi.testclient import TestClient
from app.main import app
from app.auth import get_current_admin

# Override auth dependency
app.dependency_overrides[get_current_admin] = lambda: {"id": "123", "role": "admin"}

client = TestClient(app)

# Get a product ID
import psycopg2
from psycopg2.extras import RealDictCursor
conn = psycopg2.connect(os.getenv("DATABASE_URL"))
cursor = conn.cursor(cursor_factory=RealDictCursor)
cursor.execute("SELECT id FROM products LIMIT 1")
pid = cursor.fetchone()["id"]

# Try to post
payload = {
    "product_id": str(pid),
    "deal_type": "top_deal",
    "deal_price": 50000,
    "is_active": True
}
print("Payload:", payload)
response = client.post("/api/admin/deals", json=payload)
print("Status:", response.status_code)
print("Response:", response.json())

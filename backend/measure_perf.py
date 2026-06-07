import sys
import contextlib
import io
import re
sys.path.append('c:\\Users\\Aravind\\Desktop\\MM_enterprises\\backend')
from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)

print("Starting performance measurement...")

f = io.StringIO()
with contextlib.redirect_stdout(f):
    try:
        client.get("/api/homepage?t=1")
    except Exception as e:
        print("Error homepage:", e)
    
    try:
        client.get("/api/categories")
    except Exception as e:
        print("Error cat:", e)
        
    try:
        client.get("/api/products?category=mobiles")
    except Exception as e:
        print("Error prod:", e)
        
    try:
        client.get("/api/products?category=appliances")
    except Exception as e:
        print("Error prod2:", e)
        
    try:
        client.get("/api/products/iphone-17-pro-max")
    except Exception as e:
        print("Error prod3:", e)
        
    try:
        client.get("/api/products/iphone-17-pro-max/recommendations")
    except Exception as e:
        print("Error ai:", e)

logs = f.getvalue()

timing_lines = []
for line in logs.split("\\n"):
    if "[TIMING" in line:
        try:
            match = re.search(r"\[TIMING - (.*?)\]\s+([\d\.]+)ms\s+-\s+(.*)", line)
            if match:
                type_str, duration_str, details = match.groups()
                timing_lines.append({
                    "type": type_str,
                    "duration": float(duration_str),
                    "details": details
                })
        except:
            pass

timing_lines.sort(key=lambda x: x["duration"], reverse=True)

print("\\nTop 10 Slowest Operations:")
for i, t in enumerate(timing_lines[:10]):
    print(f"{i+1}. {t['duration']:.2f}ms | [{t['type']}] {t['details']}")

# Also print everything for debugging
print("\\n--- RAW LOGS ---")
print(logs.encode('ascii', 'ignore').decode('ascii'))

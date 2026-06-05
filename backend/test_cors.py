import sys
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("--- Testing OPTIONS preflight ---")
response = client.options(
    "/api/admin/login",
    headers={
        "Origin": "https://mm-enterprises-git-main-aravindg-siprahubs-projects.vercel.app",
        "Access-Control-Request-Method": "POST",
    }
)
print("Status:", response.status_code)
print("Headers:", dict(response.headers))

if response.status_code == 200 and "access-control-allow-origin" in response.headers:
    print("SUCCESS")
else:
    print("FAILED")
    sys.exit(1)

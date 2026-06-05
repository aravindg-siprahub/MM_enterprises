import os
import requests

# Direct test on the running backend API
response = requests.get("http://localhost:8000/api/products?brand=samsung")
print(response.status_code)
print(response.json())

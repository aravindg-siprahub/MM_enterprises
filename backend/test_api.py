import requests
import json

base_url = "http://127.0.0.1:8000"

def get_product(slug):
    res = requests.get(f"{base_url}/api/products/{slug}")
    print(f"--- {slug} ---")
    print(f"Status: {res.status_code}")
    if res.status_code == 200:
        data = res.json()
        print("Keys:", list(data.keys()))
        print("product_images:", len(data.get("product_images", []) or []))
        print("brand:", data.get("brands"))
        print("category:", data.get("categories"))
    else:
        print(res.text)

get_product("redmi-note-13-proplus-5g")
get_product("apple-17")

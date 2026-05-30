import requests

BASE_URL = "http://127.0.0.1:8000"

def run_tests():
    print("Testing Phase 5A AI Endpoints...")
    res = requests.post(f"{BASE_URL}/api/admin/login", json={"email": "admin@mmenterprises.com", "password": "adminpassword"})
    if res.status_code != 200:
        print("Login failed")
        return
        
    token = res.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    print("\n--- Test 1: AI Product Description ---")
    res1 = requests.post(f"{BASE_URL}/api/admin/ai/product-description", headers=headers, json={
        "name": "Wireless Noise Cancelling Headphones",
        "category": "Electronics",
        "brand": "Sony"
    })
    print(f"Status: {res1.status_code}")
    if res1.status_code == 200:
        data = res1.json()
        print("Description:", data.get("description")[:100], "...")
        print("Features:", data.get("features"))
    else:
        print(res1.text)

    print("\n--- Test 2: AI Product SEO ---")
    res2 = requests.post(f"{BASE_URL}/api/admin/ai/seo", headers=headers, json={
        "name": "Wireless Noise Cancelling Headphones",
        "category": "Electronics"
    })
    print(f"Status: {res2.status_code}")
    if res2.status_code == 200:
        print("SEO Keywords:", res2.json().get("seo_keywords"))
    else:
        print(res2.text)

    print("\n--- Test 3: AI Category SEO ---")
    res3 = requests.post(f"{BASE_URL}/api/admin/ai/category-seo", headers=headers, json={
        "name": "Smartphones"
    })
    print(f"Status: {res3.status_code}")
    if res3.status_code == 200:
        data = res3.json()
        print("Category SEO Keywords:", data.get("seo_keywords"))
        print("Suggestions:", data.get("seo_suggestions"))
    else:
        print(res3.text)

    print("\n--- Test 4: AI Banner Copy ---")
    res4 = requests.post(f"{BASE_URL}/api/admin/ai/banner-copy", headers=headers, json={
        "placement": "hero",
        "target_audience": "Tech enthusiasts"
    })
    print(f"Status: {res4.status_code}")
    if res4.status_code == 200:
        data = res4.json()
        print("Banner Title:", data.get("title"))
        print("Banner Subtitle:", data.get("subtitle"))
        print("Banner CTA:", data.get("cta_text"))
    else:
        print(res4.text)

if __name__ == "__main__":
    run_tests()

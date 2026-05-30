import requests
import time

BASE_URL = "http://127.0.0.1:8000"
TOKEN = None

def get_headers():
    return {"Authorization": f"Bearer {TOKEN}"}

def run_tests():
    global TOKEN
    print("Starting E2E Tests...")

    # 1. Login
    res = requests.post(f"{BASE_URL}/api/admin/login", json={"email": "admin@mmenterprises.com", "password": "adminpassword"})
    assert res.status_code == 200, f"Login failed: {res.text}"
    TOKEN = res.json().get("access_token")
    print("✅ Login successful")

    # --- CATEGORIES ---
    print("\n--- CATEGORIES TEST ---")
    res = requests.post(f"{BASE_URL}/api/admin/categories", headers=get_headers(), json={"name": "Test Parent Cat", "slug": "test-parent", "is_active": True})
    assert res.status_code == 200, f"Failed to create parent category: {res.text}"
    parent_cat_id = res.json()["id"]
    print("✅ Create Parent Category")

    res = requests.post(f"{BASE_URL}/api/admin/categories", headers=get_headers(), json={"name": "Test Child Cat", "slug": "test-child", "parent_id": parent_cat_id, "is_active": True})
    assert res.status_code == 200, f"Failed to create child category: {res.text}"
    child_cat_id = res.json()["id"]
    print("✅ Create Child Category")

    res = requests.put(f"{BASE_URL}/api/admin/categories/{child_cat_id}", headers=get_headers(), json={"name": "Updated Child Cat"})
    assert res.status_code == 200, f"Failed to edit category: {res.text}"
    print("✅ Edit Category")

    res = requests.delete(f"{BASE_URL}/api/admin/categories/{child_cat_id}", headers=get_headers())
    assert res.status_code == 200, f"Failed to delete category: {res.text}"
    print("✅ Delete Category")

    # --- BRANDS ---
    print("\n--- BRANDS TEST ---")
    res = requests.post(f"{BASE_URL}/api/admin/brands", headers=get_headers(), json={"name": "Test Brand", "slug": "test-brand", "is_active": True})
    assert res.status_code == 200, f"Failed to create brand: {res.text}"
    brand_id = res.json()["id"]
    print("✅ Create Brand")

    res = requests.put(f"{BASE_URL}/api/admin/brands/{brand_id}", headers=get_headers(), json={"name": "Updated Test Brand"})
    assert res.status_code == 200, f"Failed to edit brand: {res.text}"
    print("✅ Edit Brand")

    res = requests.delete(f"{BASE_URL}/api/admin/brands/{brand_id}", headers=get_headers())
    assert res.status_code == 200, f"Failed to delete brand: {res.text}"
    print("✅ Delete Brand")

    # --- PRODUCTS ---
    print("\n--- PRODUCTS TEST ---")
    res = requests.post(f"{BASE_URL}/api/admin/products", headers=get_headers(), json={
        "name": "Test Product",
        "slug": "test-product",
        "description": "A test product",
        "selling_price": 1000,
        "mrp": 1200,
        "stock_qty": 50,
        "is_active": True
    })
    assert res.status_code == 200, f"Failed to create product: {res.text}"
    product_id = res.json()["id"]
    print("✅ Create Product")

    res = requests.put(f"{BASE_URL}/api/admin/products/{product_id}", headers=get_headers(), json={"selling_price": 950})
    assert res.status_code == 200, f"Failed to edit product: {res.text}"
    print("✅ Edit Product")

    # Deactivate Product using Edit endpoint
    res = requests.put(f"{BASE_URL}/api/admin/products/{product_id}", headers=get_headers(), json={"is_active": False})
    assert res.status_code == 200 and not res.json()["is_active"], f"Failed to deactivate product: {res.text}"
    print("✅ Deactivate Product")

    # Reactivate
    res = requests.put(f"{BASE_URL}/api/admin/products/{product_id}", headers=get_headers(), json={"is_active": True})
    assert res.status_code == 200 and res.json()["is_active"], f"Failed to reactivate product: {res.text}"
    print("✅ Reactivate Product")

    res = requests.delete(f"{BASE_URL}/api/admin/products/{product_id}", headers=get_headers())
    assert res.status_code == 200, f"Failed to delete product: {res.text}"
    print("✅ Delete Product")

    # --- BULK ACTIONS ---
    print("\n--- BULK ACTIONS TEST ---")
    p1 = requests.post(f"{BASE_URL}/api/admin/products", headers=get_headers(), json={"name": "Bulk1", "slug": "b1", "selling_price": 10, "is_active": True}).json()["id"]
    p2 = requests.post(f"{BASE_URL}/api/admin/products", headers=get_headers(), json={"name": "Bulk2", "slug": "b2", "selling_price": 10, "is_active": True}).json()["id"]
    
    res = requests.post(f"{BASE_URL}/api/admin/products/bulk", headers=get_headers(), json={"action": "deactivate", "ids": [p1, p2]})
    assert res.status_code == 200 and res.json()["count"] == 2, f"Failed bulk deactivate: {res.text}"
    print("✅ Bulk Deactivate")

    res = requests.post(f"{BASE_URL}/api/admin/products/bulk", headers=get_headers(), json={"action": "activate", "ids": [p1, p2]})
    assert res.status_code == 200 and res.json()["count"] == 2, f"Failed bulk activate: {res.text}"
    print("✅ Bulk Activate")

    res = requests.post(f"{BASE_URL}/api/admin/products/bulk", headers=get_headers(), json={"action": "delete", "ids": [p1, p2]})
    assert res.status_code == 200 and res.json()["count"] == 2, f"Failed bulk delete: {res.text}"
    print("✅ Bulk Delete")

    # --- DEALS ---
    print("\n--- DEALS TEST ---")
    p_deal = requests.post(f"{BASE_URL}/api/admin/products", headers=get_headers(), json={"name": "Deal Product", "slug": "deal-prod", "selling_price": 100, "is_active": True}).json()["id"]
    
    res = requests.post(f"{BASE_URL}/api/admin/deals", headers=get_headers(), json={"product_id": p_deal, "deal_type": "flash_sale", "deal_price": 80, "is_active": True})
    assert res.status_code == 200, f"Failed to create deal: {res.text}"
    deal_id = res.json()["id"]
    print("✅ Create Deal")

    res = requests.put(f"{BASE_URL}/api/admin/deals/{deal_id}", headers=get_headers(), json={"deal_price": 75})
    assert res.status_code == 200, f"Failed to edit deal: {res.text}"
    print("✅ Edit Deal")

    res = requests.delete(f"{BASE_URL}/api/admin/deals/{deal_id}", headers=get_headers())
    assert res.status_code == 200, f"Failed to delete deal: {res.text}"
    print("✅ Delete Deal")

    # --- BANNERS ---
    print("\n--- BANNERS TEST ---")
    res = requests.post(f"{BASE_URL}/api/admin/banners", headers=get_headers(), json={
        "title": "Test Banner",
        "image_url": "https://example.com/banner.png",
        "placement": "home_hero",
        "is_active": True
    })
    assert res.status_code == 200, f"Failed to create banner: {res.text}"
    banner_id = res.json()["id"]
    print("✅ Create Banner")

    res = requests.put(f"{BASE_URL}/api/admin/banners/{banner_id}", headers=get_headers(), json={"title": "Updated Banner"})
    assert res.status_code == 200, f"Failed to edit banner: {res.text}"
    print("✅ Edit Banner")

    res = requests.delete(f"{BASE_URL}/api/admin/banners/{banner_id}", headers=get_headers())
    assert res.status_code == 200, f"Failed to delete banner: {res.text}"
    print("✅ Delete Banner")

    # --- PAGINATION ---
    print("\n--- PAGINATION TEST ---")
    res = requests.get(f"{BASE_URL}/api/admin/products?limit=5&page=1", headers=get_headers())
    assert res.status_code == 200 and "data" in res.json() and "total" in res.json(), f"Pagination failed for products: {res.text}"
    
    res = requests.get(f"{BASE_URL}/api/admin/categories?limit=5&page=1", headers=get_headers())
    assert res.status_code == 200 and "data" in res.json() and "total" in res.json(), f"Pagination failed for categories: {res.text}"
    print("✅ Verify Pagination (Products & Categories)")

    print("\n🎉 ALL TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()

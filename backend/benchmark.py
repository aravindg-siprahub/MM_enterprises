import time
import requests

API_URL = "http://127.0.0.1:8000/api"

def benchmark(url):
    print(f"Benchmarking {url}...")
    start_time = time.time()
    try:
        response = requests.get(url)
        elapsed = time.time() - start_time
        print(f"Status Code: {response.status_code}")
        print(f"Time Taken: {elapsed:.4f} seconds")
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, dict) and 'data' in data:
                print(f"Items returned: {len(data['data'])}")
            elif isinstance(data, list):
                print(f"Items returned: {len(data)}")
    except Exception as e:
        print(f"Error: {e}")
    print("-" * 40)

if __name__ == "__main__":
    benchmark(f"{API_URL}/products?category=mobiles")
    benchmark(f"{API_URL}/brands?category=mobiles")
    
    # We need a slug to test product details
    try:
        res = requests.get(f"{API_URL}/products?category=mobiles&limit=1")
        if res.status_code == 200:
            data = res.json()
            items = data.get('data', [])
            if items:
                slug = items[0]['slug']
                
                # Run the tests twice to show cache effectiveness
                for iteration in range(1, 3):
                    print(f"\n--- RUN {iteration} ---")
                    benchmark(f"{API_URL}/products?category=mobiles")
                    benchmark(f"{API_URL}/brands?category=mobiles")
                    benchmark(f"{API_URL}/products/{slug}")
                    benchmark(f"{API_URL}/products/{slug}/similar")
                    benchmark(f"{API_URL}/products/{slug}/recommendations")
    except Exception as e:
        print(f"Error fetching slug: {e}")

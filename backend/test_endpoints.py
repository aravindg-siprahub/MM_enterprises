import requests

try:
    res = requests.post('http://127.0.0.1:8000/api/admin/login', json={'email': 'admin@mmenterprises.com', 'password': 'adminpassword'})
    print("Login status:", res.status_code)
    print(res.json())

    if res.status_code == 200:
        token = res.json().get('access_token')
        
        print('\n--- GET /api/admin/products ---')
        r1 = requests.get('http://127.0.0.1:8000/api/admin/products?limit=10', headers={'Authorization': f'Bearer {token}'})
        print(r1.status_code)
        
        print('\n--- GET /api/admin/categories ---')
        r2 = requests.get('http://127.0.0.1:8000/api/admin/categories', headers={'Authorization': f'Bearer {token}'})
        print(r2.status_code)
        
        print('\n--- GET /api/admin/brands ---')
        r3 = requests.get('http://127.0.0.1:8000/api/admin/brands', headers={'Authorization': f'Bearer {token}'})
        print(r3.status_code)
        
        print('\n--- GET /api/admin/deals ---')
        r4 = requests.get('http://127.0.0.1:8000/api/admin/deals', headers={'Authorization': f'Bearer {token}'})
        print(r4.status_code)
        
        print('\n--- GET /api/admin/banners ---')
        r5 = requests.get('http://127.0.0.1:8000/api/admin/banners', headers={'Authorization': f'Bearer {token}'})
        print(r5.status_code)
except Exception as e:
    print(e)

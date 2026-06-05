import urllib.request, json, urllib.error
try:
    req = urllib.request.Request('https://mmenterprises-production.up.railway.app/api/chat/register', data=json.dumps({'email': 'aravind@gmail.com', 'password': 'password123', 'full_name': 'Aravind'}).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='POST')
    urllib.request.urlopen(req)
except urllib.error.HTTPError as e:
    print(e.read().decode())

import urllib.request, json, urllib.error
import os, psycopg2
from dotenv import load_dotenv

print('1. Registering new user via deployed Railway backend...')
req = urllib.request.Request(
    'https://mmenterprises-production.up.railway.app/api/chat/register',
    data=json.dumps({'email': 'aravind_test1@gmail.com', 'password': 'password123', 'full_name': 'Aravind Test 1'}).encode('utf-8'),
    headers={'Content-Type': 'application/json'},
    method='POST'
)
try:
    res = urllib.request.urlopen(req)
    print('SUCCESS:', res.read().decode())
except urllib.error.HTTPError as e:
    print('ERROR:', e.code, e.read().decode())
except Exception as e:
    print('EXCEPTION:', e)

print('\n2. Checking public.users table in database directly...')
load_dotenv()
conn = psycopg2.connect(os.getenv('DATABASE_URL'))
cursor = conn.cursor()
cursor.execute('SELECT email, full_name FROM public.users WHERE email = %s', ('aravind_test1@gmail.com',))
user = cursor.fetchone()
if user:
    print('SUCCESS: Found user in public.users!', user)
else:
    print('ERROR: User not found in public.users.')


import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor
from urllib.parse import urlparse, urlunparse
import requests
from dotenv import load_dotenv

# Load backend env for DB
load_dotenv()
# Also try to load frontend env for GROQ
load_dotenv("../frontend/.env.local")

DATABASE_URL = os.getenv("DATABASE_URL")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not DATABASE_URL or not GROQ_API_KEY:
    print("Missing DATABASE_URL or GROQ_API_KEY")
    exit(1)

parsed = urlparse(DATABASE_URL)
clean_url = urlunparse(parsed._replace(query=""))

def update_prices():
    conn = psycopg2.connect(clean_url)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("SELECT id, name, original_price, selling_price FROM products;")
    products = cur.fetchall()
    
    prompt = "You are a price estimation assistant. For the following electronic devices, appliances, and furniture, provide the realistic current market price in India (in INR ₹). Return ONLY a JSON array of objects with exactly three keys: 'id' (string), 'selling_price' (integer), and 'original_price' (integer). Do not wrap the JSON in markdown code blocks. The output must start with [ and end with ]. The 'original_price' should be the MRP, and 'selling_price' should be the actual discounted market price.\n\n"
    
    catalog = []
    for p in products:
        catalog.append({"id": str(p['id']), "name": p['name'], "current_original_price": int(p['original_price']), "current_selling_price": int(p['selling_price'])})
        
    prompt += json.dumps(catalog, indent=2)
    
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.1
    }
    
    print("Calling Groq API for prices...")
    response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload)
    if response.status_code != 200:
        print("Error from Groq:", response.text)
        return
        
    data = response.json()
    content = data['choices'][0]['message']['content'].strip()
    
    # Clean up if the model wrapped it in markdown
    if content.startswith("```json"):
        content = content[7:-3]
    elif content.startswith("```"):
        content = content[3:-3]
        
    content = content.strip()
        
    try:
        new_prices = json.loads(content)
        
        for item in new_prices:
            cur.execute("""
                UPDATE products 
                SET original_price = %s, selling_price = %s 
                WHERE id = %s
            """, (item['original_price'], item['selling_price'], item['id']))
            print(f"Updated product ID {item['id']} to {item['selling_price']}")
            
            # Update the deals table as well
            cur.execute("""
                UPDATE deals 
                SET deal_price = %s 
                WHERE product_id = %s
            """, (item['selling_price'], item['id']))
            
        conn.commit()
        print("Successfully updated all prices via Groq!")
    except Exception as e:
        print("Failed to parse or update:", e)
        print("Raw content:", content)
        conn.rollback()
        
    cur.close()
    conn.close()

if __name__ == "__main__":
    update_prices()

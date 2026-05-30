import os
import sys
import json
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from urllib.parse import urlparse, urlunparse

try:
    from groq import Groq
except ImportError:
    print("Please install groq: pip install groq")
    sys.exit(1)

# Load env
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL must be set in .env")

# Clean URL
parsed = urlparse(DATABASE_URL)
clean_url = urlunparse(parsed._replace(query=""))

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def get_realistic_pricing(product_name: str, current_price: float, client: Groq = None) -> dict:
    """Uses Groq API to get realistic pricing if available, else returns dummy adjustments."""
    if not client or not GROQ_API_KEY:
        # Fallback if no API key is set
        print(f"No Groq API key found. Generating fallback data for {product_name}...")
        # Just return a realistic looking discount
        return {
            "original_price": int(current_price * 1.2),
            "selling_price": int(current_price * 0.85)
        }
    
    prompt = f"""
    You are an e-commerce pricing expert for the Indian market.
    Given the product "{product_name}", estimate its current realistic Original Market Price (MRP) and an attractive Deal/Selling Price in INR (Indian Rupees).
    Respond ONLY with a valid JSON object in this exact format:
    {{
        "original_price": 99999,
        "selling_price": 84999
    }}
    Do not include any markdown formatting, backticks, or other text. Just the raw JSON object.
    """
    
    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama3-8b-8192",
            temperature=0.1,
            max_tokens=100
        )
        result_text = response.choices[0].message.content.strip()
        # Clean potential markdown
        if result_text.startswith("```json"):
            result_text = result_text.replace("```json", "").replace("```", "").strip()
        elif result_text.startswith("```"):
            result_text = result_text.replace("```", "").strip()
            
        data = json.loads(result_text)
        return {
            "original_price": int(data.get("original_price", current_price)),
            "selling_price": int(data.get("selling_price", current_price * 0.9))
        }
    except Exception as e:
        print(f"Groq API Error for {product_name}: {e}")
        return {
            "original_price": int(current_price * 1.2),
            "selling_price": int(current_price)
        }

def main():
    client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None
    if not client:
        print("WARNING: GROQ_API_KEY not found in .env. Using realistic fallback adjustments instead.")

    conn = psycopg2.connect(clean_url)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        print("Fetching products...")
        cur.execute("SELECT id, name, original_price, selling_price FROM products;")
        products = cur.fetchall()
        
        for p in products:
            print(f"Processing: {p['name']}...")
            prices = get_realistic_pricing(p['name'], float(p['selling_price']), client)
            
            orig = prices['original_price']
            sell = prices['selling_price']
            
            print(f"  Old: {p['original_price']} -> {p['selling_price']}")
            print(f"  New: {orig} -> {sell}")
            
            # Update product
            cur.execute("""
                UPDATE products 
                SET original_price = %s, selling_price = %s 
                WHERE id = %s
            """, (orig, sell, p['id']))
            
            # Update deals table if exists
            cur.execute("""
                UPDATE deals 
                SET deal_price = %s 
                WHERE product_id = %s
            """, (sell, p['id']))
            
        conn.commit()
        print("\nSuccessfully updated all product prices!")
        
    except Exception as e:
        conn.rollback()
        print(f"Database error: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    main()

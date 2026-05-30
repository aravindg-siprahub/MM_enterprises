import psycopg2
from psycopg2.extras import RealDictCursor
import os
import json
from dotenv import load_dotenv
from urllib.parse import urlparse, urlunparse

try:
    from groq import Groq
except ImportError:
    import sys
    print("Please install groq: pip install groq")
    sys.exit(1)

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL must be set in .env")

parsed = urlparse(DATABASE_URL)
clean_url = urlunparse(parsed._replace(query=""))
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def generate_ai_content(product: dict, client: Groq) -> dict:
    if not client:
        return {
            "seo_text": f"Buy the {product['name']} at the best price.",
            "ai_summary": f"The {product['name']} is a premium product offering excellent value.",
            "specifications": {"Brand": product.get('brand_name', 'Unknown'), "Warranty": product.get('warranty_info', 'Standard')},
            "recommendations_metadata": {"tags": product.get('tags', [])}
        }
    
    prompt = f"""
    You are an expert ecommerce copywriter and technical specification generator for an Indian marketplace.
    Product: {product['name']}
    Original Price: {product['original_price']}
    Category: {product['category_name']}
    Brand: {product.get('brand_name', 'Unknown')}
    
    Generate detailed, realistic content for this product. Return ONLY a valid JSON object matching exactly this structure (no markdown, no markdown backticks, just raw JSON):
    {{
        "seo_text": "A highly optimized meta description (max 160 chars)",
        "ai_summary": "A rich, persuasive 2-paragraph HTML description highlighting key features, value proposition, and reasons to buy. Use <b> tags for emphasis and <ul> for bullets if needed.",
        "specifications": {{
            "Display/Material": "...",
            "Processor/Motor": "...",
            "RAM/Capacity": "...",
            "Storage/Dimensions": "...",
            "Battery/Power": "...",
            "Camera/Special Feature": "..."
        }},
        "recommendations_metadata": {{
            "target_audience": "e.g., Tech Enthusiasts, Families",
            "style": "e.g., Premium, Budget, Minimalist",
            "search_keywords": ["keyword1", "keyword2"]
        }}
    }}
    """
    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama3-8b-8192",
            temperature=0.2,
            max_tokens=1500
        )
        content = response.choices[0].message.content.strip()
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
        
        return json.loads(content)
    except Exception as e:
        print(f"Error calling Groq for {product['name']}: {e}")
        return None

def main():
    client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None
    if not client:
        print("WARNING: GROQ_API_KEY missing. Using fallback dummy generation.")

    conn = psycopg2.connect(clean_url)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        query = """
            SELECT p.id, p.name, p.original_price, p.tags, p.warranty_info, 
                   c.name as category_name, b.name as brand_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN brands b ON p.brand_id = b.id
            WHERE p.ai_summary IS NULL
        """
        cur.execute(query)
        products = cur.fetchall()
        
        for p in products:
            print(f"Generating details for {p['name']}...")
            data = generate_ai_content(p, client)
            if data:
                cur.execute("""
                    UPDATE products 
                    SET seo_text = %s, ai_summary = %s, specifications = %s, recommendations_metadata = %s
                    WHERE id = %s
                """, (
                    data.get('seo_text'), 
                    data.get('ai_summary'), 
                    json.dumps(data.get('specifications', {})),
                    json.dumps(data.get('recommendations_metadata', {})),
                    p['id']
                ))
                conn.commit()
                print(f"Updated {p['name']} successfully.")
            
    except Exception as e:
        conn.rollback()
        print(f"Database error: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    main()

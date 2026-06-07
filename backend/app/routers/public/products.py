from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.database import get_db
from app.schemas.product import Product
import os
import json
from groq import Groq
from app.utils.cache import api_cache, generate_cache_key

router = APIRouter()

@router.get("/products")
def get_products(
    category: Optional[str] = None, 
    brand: Optional[str] = None, 
    search: Optional[str] = None,
    sort: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_discount: Optional[int] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(24, ge=1, le=100)
):
    cache_key = generate_cache_key("products", category=category, brand=brand, search=search, sort=sort, min_price=min_price, max_price=max_price, min_discount=min_discount, page=page, limit=limit)
    cached_data = api_cache.get(cache_key)
    if cached_data:
        return cached_data

    db_gen = get_db()
    conn, cursor = next(db_gen)
    try:
        base_query = """
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN brands b ON p.brand_id = b.id
            WHERE p.is_active = true
        """
    
        params = []
        if category:
            base_query += " AND c.slug = %s"
            params.append(category)
        if brand:
            brands = [b.strip() for b in brand.split(",")]
            placeholders = ", ".join(["%s"] * len(brands))
            base_query += f" AND (b.name IN ({placeholders}) OR b.slug IN ({placeholders}))"
            params.extend(brands)
            params.extend(brands)
        if search:
            base_query += " AND p.name ILIKE %s"
            params.append(f"%{search}%")
        if min_price is not None:
            base_query += " AND p.selling_price >= %s"
            params.append(min_price)
        if max_price is not None:
            base_query += " AND p.selling_price <= %s"
            params.append(max_price)
        if min_discount is not None:
            base_query += " AND p.discount_percent >= %s"
            params.append(min_discount)
            
        # Count total
        cursor.execute(f"SELECT COUNT(*) as total {base_query}", tuple(params))
        total = cursor.fetchone()['total']
        
        # Sorting
        order_clause = "ORDER BY p.created_at DESC"
        if sort == 'newest':
            order_clause = "ORDER BY p.created_at DESC"
        elif sort == 'price_asc':
            order_clause = "ORDER BY p.selling_price ASC"
        elif sort == 'price_desc':
            order_clause = "ORDER BY p.selling_price DESC"
        elif sort == 'discount':
            order_clause = "ORDER BY p.discount_percent DESC"
        elif sort == 'rating':
            order_clause = "ORDER BY p.rating DESC"

        # Fetch data
        offset = (page - 1) * limit
        select_query = f"""
            SELECT p.*,
                (SELECT json_agg(json_build_object('id', pi.id, 'product_id', pi.product_id, 'image_url', pi.image_url, 'is_primary', pi.is_primary, 'sort_order', pi.sort_order, 'alt_text', pi.alt_text)) FROM product_images pi WHERE pi.product_id = p.id) as images,
                json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) as category,
                json_build_object('id', b.id, 'name', b.name, 'slug', b.slug) as brand,
                (SELECT json_agg(json_build_object('deal_type', d.deal_type, 'deal_price', d.deal_price, 'is_active', d.is_active)) FROM deals d WHERE d.product_id = p.id AND d.is_active = true) as deals
            {base_query}
            {order_clause}
            LIMIT %s OFFSET %s
        """
        
        cursor.execute(select_query, tuple(params) + (limit, offset))
        data = cursor.fetchall()
        
        result = {
            "data": data,
            "total": total,
            "page": page,
            "limit": limit
        }
        api_cache.set(cache_key, result)
        return result
    finally:
        try:
            next(db_gen)
        except StopIteration:
            pass

@router.get("/products/{slug}", response_model=Product)
def get_product(slug: str):
    cache_key = generate_cache_key("product_details", slug=slug)
    cached_data = api_cache.get(cache_key)
    if cached_data:
        return cached_data

    db_gen = get_db()
    conn, cursor = next(db_gen)
    try:
        query = """
        SELECT p.*,
            (SELECT json_agg(json_build_object('id', pi.id, 'product_id', pi.product_id, 'image_url', pi.image_url, 'is_primary', pi.is_primary, 'sort_order', pi.sort_order, 'alt_text', pi.alt_text) ORDER BY pi.sort_order) FROM product_images pi WHERE pi.product_id = p.id) as product_images,
            (SELECT json_agg(json_build_object('id', pv.id, 'product_id', pv.product_id, 'variant_type', pv.variant_type, 'variant_value', pv.variant_value, 'sku', pv.sku, 'price_override', pv.price_override, 'stock_quantity', pv.stock_quantity, 'image_url', pv.image_url, 'is_default', pv.is_default, 'is_active', pv.is_active, 'created_at', pv.created_at, 'updated_at', pv.updated_at)) FROM product_variants pv WHERE pv.product_id = p.id AND pv.is_active = true) as variants,
            (SELECT json_agg(json_build_object('id', pa.id, 'product_id', pa.product_id, 'attribute_name', pa.attribute_name, 'attribute_value', pa.attribute_value, 'created_at', pa.created_at, 'updated_at', pa.updated_at)) FROM product_attributes pa WHERE pa.product_id = p.id) as attributes,
            json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) as categories,
            json_build_object('id', b.id, 'name', b.name, 'slug', b.slug, 'logo_url', b.logo_url) as brands,
            (SELECT json_agg(json_build_object('deal_type', d.deal_type, 'deal_price', d.deal_price, 'ends_at', d.ends_at, 'is_active', d.is_active)) FROM deals d WHERE d.product_id = p.id) as deals,
            (SELECT json_agg(json_build_object('id', r.id, 'rating', r.rating, 'comment', r.comment, 'user_id', r.user_id, 'created_at', r.created_at)) FROM reviews r WHERE r.product_id = p.id AND r.is_approved = true) as reviews
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        WHERE p.slug = %s AND p.is_active = true
    """
        cursor.execute(query, (slug,))
        product = cursor.fetchone()
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
            
        api_cache.set(cache_key, product)
        return product
    finally:
        try:
            next(db_gen)
        except StopIteration:
            pass

@router.get("/products/{slug}/similar")
def get_similar_products(slug: str):
    cache_key = generate_cache_key("similar_products", slug=slug)
    cached_data = api_cache.get(cache_key)
    if cached_data:
        return cached_data

    db_gen = get_db()
    conn, cursor = next(db_gen)
    try:
        # Get the category_id and id of the current product
        cursor.execute("SELECT id, category_id FROM products WHERE slug = %s AND is_active = true", (slug,))
        current = cursor.fetchone()
        if not current:
            return []
        
        query = """
            SELECT p.*,
                (SELECT json_agg(json_build_object('image_url', pi.image_url, 'is_primary', pi.is_primary, 'sort_order', pi.sort_order) ORDER BY pi.sort_order) FROM product_images pi WHERE pi.product_id = p.id) as product_images,
                json_build_object('id', b.id, 'name', b.name, 'slug', b.slug) as brands,
                (SELECT json_agg(json_build_object('deal_type', d.deal_type, 'deal_price', d.deal_price, 'is_active', d.is_active)) FROM deals d WHERE d.product_id = p.id AND d.is_active = true) as deals
            FROM products p
            LEFT JOIN brands b ON p.brand_id = b.id
            WHERE p.category_id = %s AND p.id != %s AND p.is_active = true
            LIMIT 8
        """
        cursor.execute(query, (current['category_id'], current['id']))
        result = cursor.fetchall()
        api_cache.set(cache_key, result)
        return result
    finally:
        try:
            next(db_gen)
        except StopIteration:
            pass

@router.get("/products/{slug}/recommendations")
def get_ai_recommendations(slug: str):
    cache_key = generate_cache_key("ai_recommendations", slug=slug)
    cached_data = api_cache.get(cache_key)
    if cached_data:
        return cached_data

    db_gen = get_db()
    conn, cursor = next(db_gen)
    try:
        # Get current product
        cursor.execute("SELECT id, name, description, category_id FROM products WHERE slug = %s AND is_active = true", (slug,))
        current = cursor.fetchone()
        if not current:
            return []
            
        # Get all other products to pick from
        cursor.execute("SELECT name, slug, description FROM products WHERE id != %s AND is_active = true LIMIT 50", (current['id'],))
        all_products = cursor.fetchall()
        
        if not all_products:
            return []

        # Prepare prompt
        catalog = [{"slug": p['slug'], "name": p['name']} for p in all_products]
        prompt = f"""
        You are an AI ecommerce recommendation engine.
        The user is currently viewing this product:
        Name: {current['name']}
        Description: {current['description']}
        
        Here is the catalog of other available products:
        {json.dumps(catalog)}
        
        Based on the current product, select the 4 most relevant products to recommend (either accessories, competitors, or complementary items).
        Return ONLY a raw JSON array of the slugs of the recommended products, like: ["slug-1", "slug-2"]
        Do not return any markdown formatting or explanation.
        """
        
        try:
            import time
            start_ai = time.time()
            client = Groq(api_key=os.getenv("GROQ_API_KEY"))
            chat_completion = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama3-8b-8192",
                temperature=0.3,
            )
            print(f"[TIMING - AI GROQ CALL] {(time.time() - start_ai) * 1000:.2f}ms")
            
            response_text = chat_completion.choices[0].message.content.strip()
            
            # Clean markdown if present
            if response_text.startswith("```json"):
                response_text = response_text[7:-3].strip()
            elif response_text.startswith("```"):
                response_text = response_text[3:-3].strip()
                
            recommended_slugs = json.loads(response_text)
            
            if not recommended_slugs:
                return get_similar_products(slug)
                
            # Fetch the actual products
            format_strings = ','.join(['%s'] * len(recommended_slugs))
            query = f"""
                SELECT p.*,
                    (SELECT json_agg(json_build_object('image_url', pi.image_url, 'is_primary', pi.is_primary, 'sort_order', pi.sort_order) ORDER BY pi.sort_order) FROM product_images pi WHERE pi.product_id = p.id) as product_images,
                    json_build_object('id', b.id, 'name', b.name, 'slug', b.slug) as brands,
                    (SELECT json_agg(json_build_object('deal_type', d.deal_type, 'deal_price', d.deal_price, 'is_active', d.is_active)) FROM deals d WHERE d.product_id = p.id AND d.is_active = true) as deals
                FROM products p
                LEFT JOIN brands b ON p.brand_id = b.id
                WHERE p.slug IN ({format_strings}) AND p.is_active = true
            """
            cursor.execute(query, tuple(recommended_slugs))
            result = cursor.fetchall()
            api_cache.set(cache_key, result)
            return result
            
        except Exception as e:
            print(f"AI Recommendation error: {e}")
            # Fallback to similar products if Groq fails
            return get_similar_products(slug)
    finally:
        try:
            next(db_gen)
        except StopIteration:
            pass

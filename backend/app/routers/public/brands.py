from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from app.database import get_db
from app.schemas.brand import Brand
from app.utils.cache import api_cache, generate_cache_key

router = APIRouter()

@router.get("/brands", response_model=List[Brand])
def get_brands(category: Optional[str] = None):
    cache_key = generate_cache_key("brands", category=category)
    cached_data = api_cache.get(cache_key)
    if cached_data:
        return cached_data

    db_gen = get_db()
    conn, cursor = next(db_gen)
    try:
        if category:
            query = """
                SELECT DISTINCT b.* 
                FROM brands b
                JOIN products p ON p.brand_id = b.id
                JOIN categories c ON p.category_id = c.id
                WHERE b.is_active = true AND c.slug = %s
                ORDER BY b.name
            """
            cursor.execute(query, (category,))
        else:
            cursor.execute("SELECT * FROM brands WHERE is_active = true ORDER BY name")
            
        result = cursor.fetchall()
        api_cache.set(cache_key, result)
        return result
    finally:
        try:
            next(db_gen)
        except StopIteration:
            pass

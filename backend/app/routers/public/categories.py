from fastapi import APIRouter, Depends
from typing import List
from app.database import get_db
from app.schemas.category import Category
from app.utils.cache import api_cache, generate_cache_key

router = APIRouter()

@router.get("/categories", response_model=List[Category])
def get_categories():
    cache_key = generate_cache_key("categories")
    cached_data = api_cache.get(cache_key)
    if cached_data:
        return cached_data

    db_gen = get_db()
    conn, cursor = next(db_gen)
    try:
        cursor.execute("SELECT * FROM categories WHERE is_active = true ORDER BY sort_order")
        result = cursor.fetchall()
        api_cache.set(cache_key, result)
        return result
    finally:
        try:
            next(db_gen)
        except StopIteration:
            pass

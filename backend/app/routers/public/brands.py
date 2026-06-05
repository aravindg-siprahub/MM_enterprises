from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from app.database import get_db
from app.schemas.brand import Brand

router = APIRouter()

@router.get("/brands", response_model=List[Brand])
def get_brands(category: Optional[str] = None, db: tuple = Depends(get_db)):
    conn, cursor = db
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
    return cursor.fetchall()

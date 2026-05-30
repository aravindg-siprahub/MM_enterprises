from fastapi import APIRouter, Depends
from typing import List
from app.database import get_db
from app.schemas.category import Category

router = APIRouter()

@router.get("/categories", response_model=List[Category])
def get_categories(db: tuple = Depends(get_db)):
    conn, cursor = db
    cursor.execute("SELECT * FROM categories WHERE is_active = true ORDER BY sort_order")
    return cursor.fetchall()

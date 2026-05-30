from fastapi import APIRouter, Depends
from typing import List
from app.database import get_db
from app.schemas.brand import Brand

router = APIRouter()

@router.get("/brands", response_model=List[Brand])
def get_brands(db: tuple = Depends(get_db)):
    conn, cursor = db
    cursor.execute("SELECT * FROM brands WHERE is_active = true ORDER BY name")
    return cursor.fetchall()

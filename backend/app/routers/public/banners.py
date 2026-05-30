from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from app.database import get_db

router = APIRouter()

@router.get("/banners")
def get_banners(placement: Optional[str] = None, db: tuple = Depends(get_db)):
    conn, cursor = db
    
    if placement:
        cursor.execute("SELECT * FROM banners WHERE placement = %s AND is_active = true ORDER BY sort_order", (placement,))
    else:
        cursor.execute("SELECT * FROM banners WHERE is_active = true ORDER BY sort_order")
        
    return cursor.fetchall()

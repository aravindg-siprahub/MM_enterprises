from fastapi import APIRouter, Depends, HTTPException
from typing import List
import logging
from app.database import get_db, insert_record, update_record
from app.services.storage import delete_from_supabase
from app.auth import get_current_admin, get_super_admin
from app.schemas.brand import Brand, BrandCreate, BrandUpdate

logger = logging.getLogger(__name__)

router = APIRouter(dependencies=[Depends(get_current_admin)])

@router.post("/brands", response_model=Brand)
def create_brand(brand: BrandCreate, db: tuple = Depends(get_db)):
    conn, cursor = db
    record = insert_record(cursor, "brands", brand.model_dump())
    if not record:
        raise HTTPException(status_code=400, detail="Failed to create brand")
    return record

@router.get("/brands")
def get_admin_brands(page: int = 1, limit: int = 100, db: tuple = Depends(get_db)):
    conn, cursor = db
    offset = (page - 1) * limit
    cursor.execute("SELECT COUNT(*) as total FROM brands")
    total = cursor.fetchone()['total']
    cursor.execute("SELECT * FROM brands ORDER BY created_at DESC LIMIT %s OFFSET %s", (limit, offset))
    data = cursor.fetchall()
    return {"data": data, "total": total, "page": page, "limit": limit}

@router.put("/brands/{brand_id}", response_model=Brand)
def update_brand_route(brand_id: str, brand: BrandUpdate, db: tuple = Depends(get_db)):
    conn, cursor = db
    data = brand.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")
        
    try:
        if 'logo_url' in data:
            cursor.execute("SELECT logo_url FROM brands WHERE id = %s", (brand_id,))
            old_record = cursor.fetchone()
            if old_record and old_record['logo_url'] and old_record['logo_url'] != data['logo_url']:
                delete_from_supabase("brands", old_record['logo_url'])

        record = update_record(cursor, "brands", brand_id, data)
        if not record:
            raise HTTPException(status_code=404, detail="Brand not found")
            
        conn.commit()
        return record
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/brands/{brand_id}")
def delete_brand(brand_id: str, db: tuple = Depends(get_db), current_user: dict = Depends(get_current_admin)):
    conn, cursor = db
    
    logger.info(f"Delete request received for brand {brand_id}")
    logger.info(f"Current user: {current_user.get('id')}")
    logger.info(f"Role: {current_user.get('role')}")
    
    try:
        # Pre-flight check: ensure no products use this brand
        cursor.execute("SELECT id FROM products WHERE brand_id = %s LIMIT 1", (brand_id,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Cannot delete brand: It is currently used by one or more products.")

        # 1. Fetch old logo
        cursor.execute("SELECT logo_url FROM brands WHERE id = %s", (brand_id,))
        old_record = cursor.fetchone()
        
        # 2. Delete from Supabase Storage
        if old_record and old_record['logo_url']:
            delete_from_supabase("brands", old_record['logo_url'])
            
        # 3. Hard delete the brand
        cursor.execute("DELETE FROM brands WHERE id = %s RETURNING id", (brand_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Brand not found")
            
        conn.commit()
        return {"status": "success", "message": "Brand deleted successfully"}
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        logger.error(f"Error deleting brand: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

from fastapi import APIRouter, Depends, HTTPException
import logging
from app.database import get_db, insert_record, update_record
from app.services.storage import delete_from_supabase
from app.auth import get_current_admin, get_super_admin
from app.schemas.banner import Banner, BannerCreate, BannerUpdate

logger = logging.getLogger(__name__)

router = APIRouter(dependencies=[Depends(get_current_admin)])

@router.post("/banners", response_model=Banner)
def create_banner(banner: BannerCreate, db: tuple = Depends(get_db)):
    conn, cursor = db
    data = banner.model_dump()
    for k, v in data.items():
        if hasattr(v, 'isoformat'):
            data[k] = v.isoformat()
    record = insert_record(cursor, "banners", data)
    if not record:
        raise HTTPException(status_code=400, detail="Failed to create banner")
    return record

@router.get("/banners")
def get_admin_banners(page: int = 1, limit: int = 100, db: tuple = Depends(get_db)):
    conn, cursor = db
    offset = (page - 1) * limit
    cursor.execute("SELECT COUNT(*) as total FROM banners")
    total = cursor.fetchone()['total']
    cursor.execute("SELECT * FROM banners ORDER BY created_at DESC LIMIT %s OFFSET %s", (limit, offset))
    data = cursor.fetchall()
    return {"data": data, "total": total, "page": page, "limit": limit}

@router.get("/banners/{banner_id}", response_model=Banner)
def get_banner(banner_id: str, db: tuple = Depends(get_db)):
    conn, cursor = db
    cursor.execute("SELECT * FROM banners WHERE id = %s", (banner_id,))
    record = cursor.fetchone()
    if not record:
        raise HTTPException(status_code=404, detail="Banner not found")
    return record

@router.put("/banners/{banner_id}", response_model=Banner)
def update_banner_route(banner_id: str, banner: BannerUpdate, db: tuple = Depends(get_db)):
    conn, cursor = db
    data = banner.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")
    for k, v in data.items():
        if hasattr(v, 'isoformat'):
            data[k] = v.isoformat()
            
    try:
        if 'image_url' in data:
            cursor.execute("SELECT image_url FROM banners WHERE id = %s", (banner_id,))
            old_record = cursor.fetchone()
            if old_record and old_record['image_url'] and old_record['image_url'] != data['image_url']:
                delete_from_supabase("banners", old_record['image_url'])

        record = update_record(cursor, "banners", banner_id, data)
        if not record:
            raise HTTPException(status_code=404, detail="Banner not found")
            
        conn.commit()
        return record
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/banners/{banner_id}")
def delete_banner(banner_id: str, db: tuple = Depends(get_db), current_user: dict = Depends(get_current_admin)):
    conn, cursor = db
    
    logger.info(f"Delete request received for banner {banner_id}")
    logger.info(f"Current user: {current_user.get('id')}")
    logger.info(f"Role: {current_user.get('role')}")
    
    try:
        cursor.execute("SELECT image_url FROM banners WHERE id = %s", (banner_id,))
        old_record = cursor.fetchone()
        if old_record and old_record['image_url']:
            delete_from_supabase("banners", old_record['image_url'])
            
        cursor.execute("DELETE FROM banners WHERE id = %s RETURNING id", (banner_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Banner not found")
            
        conn.commit()
        return {"status": "success", "message": "Banner deleted successfully"}
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        logger.error(f"Error deleting banner: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

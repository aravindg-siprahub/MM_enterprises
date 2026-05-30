from fastapi import APIRouter, Depends, HTTPException
from typing import List
import logging
from app.database import get_db, insert_record, update_record
from app.services.storage import delete_from_supabase
from app.auth import get_current_admin, get_super_admin
from app.schemas.category import Category, CategoryCreate, CategoryUpdate

logger = logging.getLogger(__name__)

router = APIRouter(dependencies=[Depends(get_current_admin)])

@router.post("/categories", response_model=Category)
def create_category(category: CategoryCreate, db: tuple = Depends(get_db)):
    conn, cursor = db
    record = insert_record(cursor, "categories", category.model_dump())
    if not record:
        raise HTTPException(status_code=400, detail="Failed to create category")
    return record

@router.get("/categories")
def get_admin_categories(page: int = 1, limit: int = 100, db: tuple = Depends(get_db)):
    conn, cursor = db
    offset = (page - 1) * limit
    cursor.execute("SELECT COUNT(*) as total FROM categories")
    total = cursor.fetchone()['total']
    cursor.execute("SELECT * FROM categories ORDER BY sort_order LIMIT %s OFFSET %s", (limit, offset))
    data = cursor.fetchall()
    return {"data": data, "total": total, "page": page, "limit": limit}

@router.put("/categories/{category_id}", response_model=Category)
def update_category_route(category_id: str, category: CategoryUpdate, db: tuple = Depends(get_db)):
    conn, cursor = db
    data = category.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")
        
    try:
        if 'icon_url' in data:
            cursor.execute("SELECT icon_url FROM categories WHERE id = %s", (category_id,))
            old_record = cursor.fetchone()
            if old_record and old_record['icon_url'] and old_record['icon_url'] != data['icon_url']:
                delete_from_supabase("icons", old_record['icon_url'])

        record = update_record(cursor, "categories", category_id, data)
        if not record:
            raise HTTPException(status_code=404, detail="Category not found")
            
        conn.commit()
        return record
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/categories/{category_id}")
def delete_category(category_id: str, db: tuple = Depends(get_db), current_user: dict = Depends(get_current_admin)):
    conn, cursor = db
    
    logger.info(f"Delete request received for category {category_id}")
    logger.info(f"Current user: {current_user.get('id')}")
    logger.info(f"Role: {current_user.get('role')}")
    
    try:
        # Pre-flight checks
        cursor.execute("SELECT id FROM products WHERE category_id = %s LIMIT 1", (category_id,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Cannot delete category: It is currently used by one or more products.")
            
        cursor.execute("SELECT id FROM categories WHERE parent_id = %s LIMIT 1", (category_id,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Cannot delete category: It has sub-categories. Delete them first.")

        cursor.execute("SELECT icon_url FROM categories WHERE id = %s", (category_id,))
        old_record = cursor.fetchone()
        
        if old_record and old_record['icon_url']:
            delete_from_supabase("icons", old_record['icon_url'])
            
        cursor.execute("DELETE FROM categories WHERE id = %s RETURNING id", (category_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Category not found")
            
        conn.commit()
        return {"status": "success", "message": "Category deleted successfully"}
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        logger.error(f"Error deleting category: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

from fastapi import APIRouter, Depends, HTTPException
import logging
from app.database import get_db, insert_record, update_record
from app.auth import get_current_admin, get_super_admin
from app.schemas.deal import Deal, DealCreate, DealUpdate

logger = logging.getLogger(__name__)

router = APIRouter(dependencies=[Depends(get_current_admin)])

@router.post("/deals", response_model=Deal)
def create_deal(deal: DealCreate, db: tuple = Depends(get_db)):
    conn, cursor = db
    data = deal.model_dump()
    for k, v in data.items():
        if hasattr(v, 'isoformat'):
            data[k] = v.isoformat()
    record = insert_record(cursor, "deals", data)
    if not record:
        raise HTTPException(status_code=400, detail="Failed to create deal")
    return record

@router.get("/deals")
def get_admin_deals(page: int = 1, limit: int = 100, db: tuple = Depends(get_db)):
    conn, cursor = db
    offset = (page - 1) * limit
    cursor.execute("SELECT COUNT(*) as total FROM deals")
    total = cursor.fetchone()['total']
    
    query = """
        SELECT d.*, 
            json_build_object('id', p.id, 'name', p.name) as product
        FROM deals d
        LEFT JOIN products p ON d.product_id = p.id
        ORDER BY d.created_at DESC
        LIMIT %s OFFSET %s
    """
    cursor.execute(query, (limit, offset))
    data = cursor.fetchall()
    return {"data": data, "total": total, "page": page, "limit": limit}

@router.put("/deals/{deal_id}", response_model=Deal)
def update_deal_route(deal_id: str, deal: DealUpdate, db: tuple = Depends(get_db)):
    conn, cursor = db
    data = deal.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")
    for k, v in data.items():
        if hasattr(v, 'isoformat'):
            data[k] = v.isoformat()
    record = update_record(cursor, "deals", deal_id, data)
    if not record:
        raise HTTPException(status_code=404, detail="Deal not found")
    return record

@router.delete("/deals/{deal_id}")
def delete_deal(deal_id: str, db: tuple = Depends(get_db), current_user: dict = Depends(get_current_admin)):
    conn, cursor = db
    
    logger.info(f"Delete request received for deal {deal_id}")
    logger.info(f"Current user: {current_user.get('id')}")
    logger.info(f"Role: {current_user.get('role')}")
    
    try:
        cursor.execute("DELETE FROM deals WHERE id = %s RETURNING id", (deal_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Deal not found")
            
        conn.commit()
        return {"status": "success", "message": "Deal deleted successfully"}
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        logger.error(f"Error deleting deal: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

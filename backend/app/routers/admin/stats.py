from fastapi import APIRouter, Depends
from app.database import get_db
from app.auth import get_current_admin

router = APIRouter(dependencies=[Depends(get_current_admin)])

@router.get("/stats")
def get_stats(db: tuple = Depends(get_db)):
    conn, cursor = db
    
    cursor.execute("SELECT COUNT(id) as count FROM products")
    total_products = cursor.fetchone()['count']
    
    cursor.execute("SELECT COUNT(id) as count FROM products WHERE is_active = true")
    active_products = cursor.fetchone()['count']
    
    cursor.execute("SELECT COUNT(id) as count FROM categories")
    total_categories = cursor.fetchone()['count']
    
    cursor.execute("SELECT COUNT(id) as count FROM brands")
    total_brands = cursor.fetchone()['count']
    
    cursor.execute("SELECT COUNT(id) as count FROM banners WHERE is_active = true")
    active_banners = cursor.fetchone()['count']
    
    cursor.execute("SELECT COUNT(id) as count FROM deals WHERE is_active = true")
    active_deals = cursor.fetchone()['count']
    
    return {
        "total_products": total_products,
        "active_products": active_products,
        "total_categories": total_categories,
        "total_brands": total_brands,
        "active_banners": active_banners,
        "active_deals": active_deals
    }

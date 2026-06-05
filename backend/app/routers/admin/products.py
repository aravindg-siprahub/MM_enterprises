from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import List
import re
import logging
from app.database import get_db, insert_record, update_record
from app.services.storage import delete_from_supabase
from app.auth import get_current_admin, get_super_admin
from app.schemas.product import (
    Product, ProductCreate, ProductUpdate, 
    ProductImageCreate, ProductImage,
    ProductVariantCreate, ProductVariantUpdate, ProductVariant,
    ProductAttributeCreate, ProductAttributeUpdate, ProductAttribute
)

logger = logging.getLogger(__name__)
from pydantic import BaseModel

class BulkAction(BaseModel):
    action: str
    ids: List[str]

router = APIRouter(dependencies=[Depends(get_current_admin)])

def generate_slug(name: str) -> str:
    slug = name.lower()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'\s+', '-', slug.strip())
    slug = re.sub(r'-+', '-', slug)
    return slug

def bg_delete_images(images: list):
    for img in images:
        delete_from_supabase("products", img['image_url'])

def bg_delete_urls(urls: list):
    for url in urls:
        delete_from_supabase("products", url)

@router.post("/products", response_model=Product)
def create_product(product: ProductCreate, db: tuple = Depends(get_db)):
    conn, cursor = db
    dump = product.model_dump()
    if not dump.get('slug'):
        dump['slug'] = generate_slug(dump['name'])
        
    images_data = dump.pop('images', None)
    variants_data = dump.pop('variants', None)
    attributes_data = dump.pop('attributes', None)
    
    record = insert_record(cursor, "products", dump)
    if not record:
        raise HTTPException(status_code=400, detail="Failed to create product")
        
    if images_data:
        for img in images_data:
            img_dump = {
                'product_id': record['id'],
                'image_url': img['image_url'],
                'is_primary': img.get('is_primary', False),
                'sort_order': img.get('sort_order', 0),
                'alt_text': img.get('alt_text', None)
            }
            insert_record(cursor, "product_images", img_dump)
            
    if variants_data:
        for variant in variants_data:
            variant['product_id'] = record['id']
            insert_record(cursor, "product_variants", variant)
            
    if attributes_data:
        for attr in attributes_data:
            attr['product_id'] = record['id']
            insert_record(cursor, "product_attributes", attr)
            
    cursor.execute("""
        SELECT p.*,
            (SELECT json_agg(json_build_object('id', pi.id, 'product_id', pi.product_id, 'image_url', pi.image_url, 'is_primary', pi.is_primary, 'sort_order', pi.sort_order, 'alt_text', pi.alt_text) ORDER BY pi.sort_order) FROM product_images pi WHERE pi.product_id = p.id) as images,
            json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) as category,
            json_build_object('id', b.id, 'name', b.name, 'slug', b.slug) as brand
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        WHERE p.id = %s
    """, (record['id'],))
    return cursor.fetchone()

@router.get("/products")
def get_admin_products(page: int = 1, limit: int = 100, db: tuple = Depends(get_db)):
    conn, cursor = db
    offset = (page - 1) * limit
    
    cursor.execute("SELECT COUNT(*) as total FROM products")
    total = cursor.fetchone()['total']
    
    query = """
        SELECT p.*,
            (SELECT json_agg(json_build_object('id', pi.id, 'product_id', pi.product_id, 'image_url', pi.image_url, 'is_primary', pi.is_primary, 'sort_order', pi.sort_order, 'alt_text', pi.alt_text)) FROM product_images pi WHERE pi.product_id = p.id) as images,
            json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) as category,
            json_build_object('id', b.id, 'name', b.name, 'slug', b.slug) as brand
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        ORDER BY p.created_at DESC
        LIMIT %s OFFSET %s
    """
    cursor.execute(query, (limit, offset))
    data = cursor.fetchall()
    
    return {
        "data": data,
        "total": total,
        "page": page,
        "limit": limit
    }

@router.get("/products/{product_id}", response_model=Product)
def get_admin_product(product_id: str, db: tuple = Depends(get_db)):
    conn, cursor = db
    query = """
        SELECT p.*,
            (SELECT json_agg(json_build_object('id', pi.id, 'product_id', pi.product_id, 'image_url', pi.image_url, 'is_primary', pi.is_primary, 'sort_order', pi.sort_order, 'alt_text', pi.alt_text) ORDER BY pi.sort_order) FROM product_images pi WHERE pi.product_id = p.id) as images,
            (SELECT json_agg(json_build_object('id', pv.id, 'product_id', pv.product_id, 'variant_type', pv.variant_type, 'variant_value', pv.variant_value, 'sku', pv.sku, 'price_override', pv.price_override, 'stock_quantity', pv.stock_quantity, 'image_url', pv.image_url, 'is_default', pv.is_default, 'is_active', pv.is_active, 'created_at', pv.created_at, 'updated_at', pv.updated_at)) FROM product_variants pv WHERE pv.product_id = p.id) as variants,
            (SELECT json_agg(json_build_object('id', pa.id, 'product_id', pa.product_id, 'attribute_name', pa.attribute_name, 'attribute_value', pa.attribute_value, 'created_at', pa.created_at, 'updated_at', pa.updated_at)) FROM product_attributes pa WHERE pa.product_id = p.id) as attributes,
            json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) as category,
            json_build_object('id', b.id, 'name', b.name, 'slug', b.slug) as brand
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        WHERE p.id = %s
    """
    cursor.execute(query, (product_id,))
    product = cursor.fetchone()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.put("/products/{product_id}", response_model=Product)
def update_product_route(product_id: str, product: ProductUpdate, background_tasks: BackgroundTasks, db: tuple = Depends(get_db)):
    conn, cursor = db
    data = product.model_dump(exclude_unset=True)
    images_data = data.pop('images', None)
    # discount_percent is a PostgreSQL generated column; strip it to avoid update errors
    data.pop('discount_percent', None)
    
    if not data and images_data is None:
        raise HTTPException(status_code=400, detail="No fields to update")
        
    try:
        if data:
            record = update_record(cursor, "products", product_id, data)
            if not record:
                raise HTTPException(status_code=404, detail="Product not found")
        
        if images_data is not None:
            # Sync images
            cursor.execute("SELECT id, image_url FROM product_images WHERE product_id = %s", (product_id,))
            existing_images = cursor.fetchall()
            existing_urls = {img['image_url']: img['id'] for img in existing_images}
            new_urls = [img['image_url'] for img in images_data]
            
            # Delete removed images in the background
            urls_to_delete = []
            for ext_url, ext_id in existing_urls.items():
                if ext_url not in new_urls:
                    urls_to_delete.append(ext_url)
                    cursor.execute("DELETE FROM product_images WHERE id = %s", (ext_id,))
            if urls_to_delete:
                background_tasks.add_task(bg_delete_urls, urls_to_delete)
            
            # Insert or update new images
            for img in images_data:
                if img['image_url'] not in existing_urls:
                    img_dump = {
                        'product_id': product_id,
                        'image_url': img['image_url'],
                        'is_primary': img.get('is_primary', False),
                        'sort_order': img.get('sort_order', 0)
                    }
                    insert_record(cursor, "product_images", img_dump)
                else:
                    cursor.execute("UPDATE product_images SET is_primary = %s, sort_order = %s WHERE id = %s", (img.get('is_primary', False), img.get('sort_order', 0), existing_urls[img['image_url']]))
                    
        conn.commit()
        cursor.execute("""
            SELECT p.*,
                (SELECT json_agg(json_build_object('id', pi.id, 'product_id', pi.product_id, 'image_url', pi.image_url, 'is_primary', pi.is_primary, 'sort_order', pi.sort_order, 'alt_text', pi.alt_text) ORDER BY pi.sort_order) FROM product_images pi WHERE pi.product_id = p.id) as images,
                json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) as category,
                json_build_object('id', b.id, 'name', b.name, 'slug', b.slug) as brand
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN brands b ON p.brand_id = b.id
            WHERE p.id = %s
        """, (product_id,))
        return cursor.fetchone()
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/products/{product_id}")
def delete_product(product_id: str, background_tasks: BackgroundTasks, db: tuple = Depends(get_db), current_user: dict = Depends(get_current_admin)):
    conn, cursor = db
    
    logger.info(f"Delete request received for product {product_id}")
    logger.info(f"Current user: {current_user.get('id')}")
    logger.info(f"Role: {current_user.get('role')}")
    
    try:
        # 1. Fetch all associated images from product_images
        cursor.execute("SELECT image_url FROM product_images WHERE product_id = %s", (product_id,))
        images = cursor.fetchall()
        
        # 2. Delete images from Supabase Storage in the background
        if images:
            background_tasks.add_task(bg_delete_images, images)
            
        # 3. Delete from product_images DB table
        cursor.execute("DELETE FROM product_images WHERE product_id = %s", (product_id,))
        
        # 3.5 Delete from conversations DB table (avoids FK constraint violation since it doesn't have ON DELETE CASCADE)
        cursor.execute("DELETE FROM conversations WHERE product_id = %s", (product_id,))
        
        # 4. Hard delete the product
        cursor.execute("DELETE FROM products WHERE id = %s RETURNING id", (product_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Product not found")
            
        conn.commit()
        return {"status": "success", "message": "Product deleted successfully"}
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        logger.error(f"Error deleting product: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/products/bulk")
def bulk_action_products(payload: BulkAction, db: tuple = Depends(get_db)):
    conn, cursor = db
    if not payload.ids:
        return {"status": "success", "count": 0}
        
    ids_tuple = tuple(payload.ids)
    format_strings = ','.join(['%s'] * len(payload.ids))
    
    if payload.action == 'delete' or payload.action == 'deactivate':
        query = f"UPDATE products SET is_active = false WHERE id IN ({format_strings})"
        cursor.execute(query, ids_tuple)
    elif payload.action == 'activate':
        query = f"UPDATE products SET is_active = true WHERE id IN ({format_strings})"
        cursor.execute(query, ids_tuple)
    else:
        raise HTTPException(status_code=400, detail="Invalid action")
        
    return {"status": "success", "count": cursor.rowcount}

@router.post("/products/{product_id}/images", response_model=ProductImage)
def add_product_image(product_id: str, image: ProductImageCreate, db: tuple = Depends(get_db)):
    conn, cursor = db
    if image.product_id != product_id:
        raise HTTPException(status_code=400, detail="Product ID mismatch")
    record = insert_record(cursor, "product_images", image.model_dump())
    return record

@router.put("/products/{product_id}/images/{img_id}/primary")
def set_primary_image(product_id: str, img_id: str, db: tuple = Depends(get_db)):
    conn, cursor = db
    cursor.execute("UPDATE product_images SET is_primary = false WHERE product_id = %s", (product_id,))
    cursor.execute("UPDATE product_images SET is_primary = true WHERE id = %s AND product_id = %s", (img_id, product_id))
    return {"status": "success"}

@router.delete("/products/{product_id}/images/{img_id}")
def delete_product_image(product_id: str, img_id: str, db: tuple = Depends(get_db), admin: dict = Depends(get_super_admin)):
    conn, cursor = db
    cursor.execute("DELETE FROM product_images WHERE id = %s AND product_id = %s", (img_id, product_id))
    return {"status": "success"}

@router.post("/products/{product_id}/variants", response_model=ProductVariant)
def add_product_variant(product_id: str, variant: ProductVariantCreate, db: tuple = Depends(get_db)):
    conn, cursor = db
    if variant.product_id != product_id:
        raise HTTPException(status_code=400, detail="Product ID mismatch")
    record = insert_record(cursor, "product_variants", variant.model_dump())
    return record

@router.put("/products/variants/{variant_id}", response_model=ProductVariant)
def update_product_variant(variant_id: str, variant: ProductVariantUpdate, db: tuple = Depends(get_db)):
    conn, cursor = db
    data = variant.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")
    record = update_record(cursor, "product_variants", variant_id, data)
    if not record:
        raise HTTPException(status_code=404, detail="Variant not found")
    return record

@router.delete("/products/variants/{variant_id}")
def delete_product_variant(variant_id: str, db: tuple = Depends(get_db)):
    conn, cursor = db
    cursor.execute("DELETE FROM product_variants WHERE id = %s RETURNING id", (variant_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Variant not found")
    return {"status": "success"}

@router.post("/products/{product_id}/attributes", response_model=ProductAttribute)
def add_product_attribute(product_id: str, attribute: ProductAttributeCreate, db: tuple = Depends(get_db)):
    conn, cursor = db
    if attribute.product_id != product_id:
        raise HTTPException(status_code=400, detail="Product ID mismatch")
    
    # Check if attribute exists
    cursor.execute("SELECT id FROM product_attributes WHERE product_id = %s AND attribute_name = %s", (product_id, attribute.attribute_name))
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="Attribute already exists for this product")
        
    record = insert_record(cursor, "product_attributes", attribute.model_dump())
    return record

@router.put("/products/attributes/{attribute_id}", response_model=ProductAttribute)
def update_product_attribute(attribute_id: str, attribute: ProductAttributeUpdate, db: tuple = Depends(get_db)):
    conn, cursor = db
    data = attribute.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")
    record = update_record(cursor, "product_attributes", attribute_id, data)
    if not record:
        raise HTTPException(status_code=404, detail="Attribute not found")
    return record

@router.delete("/products/attributes/{attribute_id}")
def delete_product_attribute(attribute_id: str, db: tuple = Depends(get_db)):
    conn, cursor = db
    cursor.execute("DELETE FROM product_attributes WHERE id = %s RETURNING id", (attribute_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Attribute not found")
    return {"status": "success"}

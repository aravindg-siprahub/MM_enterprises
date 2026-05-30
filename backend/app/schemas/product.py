from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class ProductImageBase(BaseModel):
    image_url: str
    alt_text: Optional[str] = None
    is_primary: bool = False
    sort_order: int = 0

class ProductImageCreate(ProductImageBase):
    product_id: str

class ProductImage(ProductImageBase):
    id: str
    product_id: str
    
    model_config = ConfigDict(from_attributes=True)

class ProductBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    category_id: Optional[str] = None
    brand_id: Optional[str] = None
    original_price: float
    selling_price: float
    stock_qty: int = 0
    warranty_info: Optional[str] = None
    tags: Optional[List[str]] = None
    is_active: bool = True
    is_featured: bool = False
    is_top_deal: bool = False

class ProductCreate(ProductBase):
    images: Optional[List[ProductImageBase]] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[str] = None
    brand_id: Optional[str] = None
    original_price: Optional[float] = None
    selling_price: Optional[float] = None
    stock_qty: Optional[int] = None
    warranty_info: Optional[str] = None
    tags: Optional[List[str]] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    is_top_deal: Optional[bool] = None
    images: Optional[List['ProductImageBase']] = None

class Product(ProductBase):
    id: str
    discount_percent: Optional[int] = None
    rating: float
    review_count: int
    created_at: datetime
    updated_at: datetime
    images: Optional[List[ProductImage]] = None
    
    # Add fields expected by the SQL query and Frontend
    product_images: Optional[list] = None
    categories: Optional[dict] = None
    brands: Optional[dict] = None
    deals: Optional[list] = None
    reviews: Optional[list] = None
    
    model_config = ConfigDict(from_attributes=True)

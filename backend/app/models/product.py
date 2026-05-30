from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.models.category import CategoryResponse
from app.models.brand import BrandResponse

class ProductImageBase(BaseModel):
    image_url: str
    alt_text: Optional[str] = None
    is_primary: bool = False
    sort_order: int = 0

class ProductImageCreate(ProductImageBase):
    pass

class ProductImageResponse(ProductImageBase):
    id: str
    product_id: str
    model_config = ConfigDict(from_attributes=True)

class ProductBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    category_id: str
    brand_id: str
    original_price: float
    selling_price: float
    discount_percent: Optional[int] = None
    stock_qty: int = 0
    is_active: bool = True
    is_featured: bool = False
    is_top_deal: bool = False
    warranty_info: Optional[str] = None
    tags: Optional[List[str]] = None
    seo_text: Optional[str] = None
    ai_summary: Optional[str] = None
    specifications: Optional[dict] = None
    recommendations_metadata: Optional[dict] = None

class ProductCreate(ProductBase):
    images: Optional[List[ProductImageCreate]] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[str] = None
    brand_id: Optional[str] = None
    original_price: Optional[float] = None
    selling_price: Optional[float] = None
    discount_percent: Optional[int] = None
    stock_qty: Optional[int] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    is_top_deal: Optional[bool] = None
    warranty_info: Optional[str] = None
    tags: Optional[List[str]] = None

class ProductResponse(ProductBase):
    id: str
    created_at: datetime
    updated_at: datetime
    images: Optional[List[ProductImageResponse]] = None
    category: Optional[CategoryResponse] = None
    brand: Optional[BrandResponse] = None
    model_config = ConfigDict(from_attributes=True)

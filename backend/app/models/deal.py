from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.models.product import ProductResponse

class DealBase(BaseModel):
    product_id: str
    deal_type: Optional[str] = None
    deal_price: Optional[float] = None
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None
    is_active: bool = True

class DealCreate(DealBase):
    pass

class DealUpdate(BaseModel):
    product_id: Optional[str] = None
    deal_type: Optional[str] = None
    deal_price: Optional[float] = None
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None
    is_active: Optional[bool] = None

class DealResponse(DealBase):
    id: str
    created_at: datetime
    product: Optional[ProductResponse] = None
    model_config = ConfigDict(from_attributes=True)

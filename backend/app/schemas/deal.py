from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class DealBase(BaseModel):
    product_id: str
    deal_type: str
    deal_price: Optional[float] = None
    ends_at: Optional[datetime] = None
    is_active: bool = True
    sort_order: int = 0

class DealCreate(DealBase):
    pass

class DealUpdate(BaseModel):
    product_id: Optional[str] = None
    deal_type: Optional[str] = None
    deal_price: Optional[float] = None
    ends_at: Optional[datetime] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None

class Deal(DealBase):
    id: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

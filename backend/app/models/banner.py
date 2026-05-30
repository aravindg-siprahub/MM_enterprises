from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class BannerBase(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    image_url: str
    link_url: Optional[str] = None
    category_id: Optional[str] = None
    placement: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None

class BannerCreate(BannerBase):
    pass

class BannerUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    image_url: Optional[str] = None
    link_url: Optional[str] = None
    category_id: Optional[str] = None
    placement: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None

class BannerResponse(BannerBase):
    id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

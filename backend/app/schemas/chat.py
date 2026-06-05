from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class MessageBase(BaseModel):
    message: str

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: str
    conversation_id: str
    sender_type: str
    status: str
    is_read: bool
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ConversationBase(BaseModel):
    product_id: str

class ConversationCreate(ConversationBase):
    pass

class ConversationResponse(ConversationBase):
    id: str
    user_id: str
    status: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ConversationListResponse(ConversationResponse):
    customer_name: Optional[str] = None
    product_name: Optional[str] = None
    product_slug: Optional[str] = None
    product_image: Optional[str] = None
    product_price: Optional[float] = None
    last_message: Optional[str] = None
    unread_count: int = 0
    model_config = ConfigDict(from_attributes=True)

class ConversationWithMessagesResponse(BaseModel):
    conversation: ConversationResponse
    messages: List[MessageResponse]
    model_config = ConfigDict(from_attributes=True)

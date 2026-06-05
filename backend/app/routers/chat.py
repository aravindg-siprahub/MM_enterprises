from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from app.database import get_db
from app.auth import get_current_user, get_current_admin
from app.schemas.chat import ConversationCreate, ConversationResponse, ConversationListResponse, MessageCreate, MessageResponse, ConversationWithMessagesResponse
import app.services.chat as chat_service

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/conversations", response_model=ConversationResponse)
def create_conversation(
    conv_in: ConversationCreate,
    current_user: dict = Depends(get_current_user),
    db: tuple = Depends(get_db)
):
    conn, cursor = db
    try:
        conversation = chat_service.get_or_create_conversation(
            cursor, 
            user_id=current_user['id'], 
            product_id=conv_in.product_id
        )
        conn.commit()
        return conversation
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/conversations", response_model=List[ConversationListResponse])
def get_conversations(
    current_user: dict = Depends(get_current_user),
    db: tuple = Depends(get_db)
):
    _, cursor = db
    conversations = chat_service.get_user_conversations(cursor, user_id=current_user['id'])
    return conversations

@router.get("/product/{product_id}", response_model=ConversationWithMessagesResponse)
def get_or_open_chat(
    product_id: str,
    current_user: dict = Depends(get_current_user),
    db: tuple = Depends(get_db)
):
    """Single-trip endpoint: get or create conversation + messages for a product."""
    conn, cursor = db
    try:
        result = chat_service.get_conversation_with_messages(
            cursor, user_id=current_user['id'], product_id=product_id
        )
        conn.commit()
        return result
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/admin/conversations", response_model=List[ConversationListResponse])
def get_admin_conversations(
    limit: int = 50,
    offset: int = 0,
    unread_only: bool = False,
    search: Optional[str] = None,
    current_admin: dict = Depends(get_current_admin),
    db: tuple = Depends(get_db)
):
    _, cursor = db
    conversations = chat_service.get_admin_conversations(
        cursor, limit=limit, offset=offset, unread_only=unread_only, search=search
    )
    return conversations

@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
def get_messages(
    conversation_id: str,
    limit: int = 50,
    offset: int = 0,
    current_user: dict = Depends(get_current_user),
    db: tuple = Depends(get_db)
):
    _, cursor = db
    messages = chat_service.get_messages(cursor, conversation_id, limit, offset, user_id=current_user['id'])
    return messages

@router.get("/admin/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
def get_admin_messages(
    conversation_id: str,
    limit: int = 50,
    offset: int = 0,
    current_admin: dict = Depends(get_current_admin),
    db: tuple = Depends(get_db)
):
    _, cursor = db
    messages = chat_service.get_messages(cursor, conversation_id, limit, offset)
    return messages

@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse)
def add_message(
    conversation_id: str,
    msg_in: MessageCreate,
    current_user: dict = Depends(get_current_user),
    db: tuple = Depends(get_db)
):
    conn, cursor = db
    try:
        msg = chat_service.add_message(
            cursor, 
            conversation_id=conversation_id, 
            sender_type="user", 
            message=msg_in.message,
            user_id=current_user['id']
        )
        conn.commit()
        return msg
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/admin/conversations/{conversation_id}/messages", response_model=MessageResponse)
def add_admin_message(
    conversation_id: str,
    msg_in: MessageCreate,
    current_admin: dict = Depends(get_current_admin),
    db: tuple = Depends(get_db)
):
    conn, cursor = db
    try:
        msg = chat_service.add_message(
            cursor, 
            conversation_id=conversation_id, 
            sender_type="admin", 
            message=msg_in.message
        )
        conn.commit()
        return msg
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/conversations/{conversation_id}/read")
def mark_read_user(
    conversation_id: str,
    current_user: dict = Depends(get_current_user),
    db: tuple = Depends(get_db)
):
    conn, cursor = db
    try:
        updated_count = chat_service.mark_messages_read(
            cursor, 
            conversation_id, 
            reader_type="user", 
            user_id=current_user['id']
        )
        conn.commit()
        return {"success": True, "updated": updated_count}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/admin/conversations/{conversation_id}/read")
def mark_read_admin(
    conversation_id: str,
    current_admin: dict = Depends(get_current_admin),
    db: tuple = Depends(get_db)
):
    conn, cursor = db
    try:
        updated_count = chat_service.mark_messages_read(cursor, conversation_id, reader_type="admin")
        conn.commit()
        return {"success": True, "updated": updated_count}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))

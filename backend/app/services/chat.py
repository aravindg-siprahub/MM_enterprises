from typing import List, Optional
from datetime import datetime
from psycopg2.extras import RealDictCursor

def get_or_create_conversation(cursor: RealDictCursor, user_id: str, product_id: str) -> dict:
    # Use UPSERT to prevent race conditions and handle concurrent requests gracefully
    cursor.execute("""
        INSERT INTO conversations (user_id, product_id, status, updated_at)
        VALUES (%s, %s, 'active', now())
        ON CONFLICT (user_id, product_id) 
        DO UPDATE SET status = 'active', updated_at = EXCLUDED.updated_at
        RETURNING *
    """, (user_id, product_id))
    return cursor.fetchone()

def get_conversation_with_messages(cursor: RealDictCursor, user_id: str, product_id: str) -> dict:
    """Get or create a conversation and return its messages in ONE round-trip."""
    # Get or create the conversation
    cursor.execute("""
        INSERT INTO conversations (user_id, product_id, status, updated_at)
        VALUES (%s, %s, 'active', now())
        ON CONFLICT (user_id, product_id)
        DO UPDATE SET updated_at = now()
        RETURNING *
    """, (user_id, product_id))
    conversation = cursor.fetchone()
    conversation_id = conversation['id']

    # Fetch messages for this conversation
    cursor.execute("""
        SELECT m.*
        FROM messages m
        WHERE m.conversation_id = %s
        ORDER BY m.created_at ASC
        LIMIT 100
    """, (conversation_id,))
    messages = cursor.fetchall()

    return {"conversation": conversation, "messages": messages}

def get_user_conversations(cursor: RealDictCursor, user_id: str) -> List[dict]:
    cursor.execute("""
        SELECT c.*, 
               p.name as product_name, p.selling_price as product_price, p.slug as product_slug,
               (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true LIMIT 1) as product_image,
               (SELECT m.message FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message,
               (SELECT count(*) FROM messages m WHERE m.conversation_id = c.id AND m.is_read = false AND m.sender_type = 'admin') as unread_count
        FROM conversations c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = %s
        ORDER BY c.updated_at DESC
    """, (user_id,))
    return cursor.fetchall()

def get_admin_conversations(cursor: RealDictCursor, limit: int = 50, offset: int = 0, unread_only: bool = False, search: str = None) -> List[dict]:
    query = """
        SELECT c.*, 
               COALESCE(
                   NULLIF(TRIM(u.raw_user_meta_data->>'full_name'), ''),
                   u.email
               ) as customer_name,
               p.name as product_name, p.selling_price as product_price, p.slug as product_slug,
               (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true LIMIT 1) as product_image,
               (SELECT m.message FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message,
               (SELECT count(*) FROM messages m WHERE m.conversation_id = c.id AND m.is_read = false AND m.sender_type = 'user') as unread_count
        FROM conversations c
        JOIN products p ON c.product_id = p.id
        LEFT JOIN auth.users u ON c.user_id = u.id
        WHERE 1=1
    """
    params = []
    
    if unread_only:
        query += " AND EXISTS (SELECT 1 FROM messages m WHERE m.conversation_id = c.id AND m.is_read = false AND m.sender_type = 'user')"
        
    if search:
        query += " AND (p.name ILIKE %s OR u.raw_user_meta_data->>'full_name' ILIKE %s OR u.email ILIKE %s)"
        params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])
        
    query += " ORDER BY c.updated_at DESC LIMIT %s OFFSET %s"
    params.extend([limit, offset])
    
    cursor.execute(query, tuple(params))
    return cursor.fetchall()

def get_messages(cursor: RealDictCursor, conversation_id: str, limit: int = 50, offset: int = 0, user_id: str = None) -> List[dict]:
    query = """
        SELECT m.* FROM messages m
        JOIN conversations c ON m.conversation_id = c.id
        WHERE m.conversation_id = %s
    """
    params = [conversation_id]
    
    if user_id:
        query += " AND c.user_id = %s"
        params.append(user_id)
        
    query += " ORDER BY m.created_at ASC LIMIT %s OFFSET %s"
    params.extend([limit, offset])
    
    cursor.execute(query, tuple(params))
    return cursor.fetchall()

def add_message(cursor: RealDictCursor, conversation_id: str, sender_type: str, message: str, user_id: str = None) -> dict:
    if user_id:
        # Verify ownership
        cursor.execute("SELECT id FROM conversations WHERE id = %s AND user_id = %s", (conversation_id, user_id))
        if not cursor.fetchone():
            raise Exception("Unauthorized: You do not own this conversation")
            
    cursor.execute("""
        INSERT INTO messages (conversation_id, sender_type, message) 
        VALUES (%s, %s, %s) RETURNING *
    """, (conversation_id, sender_type, message))
    msg = cursor.fetchone()
    
    # Update conversation updated_at
    cursor.execute("""
        UPDATE conversations SET updated_at = now() WHERE id = %s
    """, (conversation_id,))
    
    return msg

def mark_messages_read(cursor: RealDictCursor, conversation_id: str, reader_type: str, user_id: str = None) -> int:
    if user_id:
        cursor.execute("SELECT id FROM conversations WHERE id = %s AND user_id = %s", (conversation_id, user_id))
        if not cursor.fetchone():
            raise Exception("Unauthorized: You do not own this conversation")
            
    sender_to_mark = 'admin' if reader_type == 'user' else 'user'
    cursor.execute("""
        UPDATE messages 
        SET is_read = true, status = 'read', updated_at = now()
        WHERE conversation_id = %s AND sender_type = %s AND is_read = false
        RETURNING id
    """, (conversation_id, sender_to_mark))
    return cursor.rowcount

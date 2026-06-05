import os
import psycopg2
from psycopg2.extras import RealDictCursor
from app.database import get_db_connection

def audit_database():
    print("--- Phase 1: Database Validation ---")
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    # 1. Check tables
    cursor.execute("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")
    tables = [r['tablename'] for r in cursor.fetchall()]
    assert 'conversations' in tables, "conversations table missing"
    assert 'messages' in tables, "messages table missing"
    print("✅ Tables 'conversations' and 'messages' exist.")
    
    # 2. Check foreign keys
    cursor.execute("""
        SELECT
            tc.table_name, 
            kcu.column_name, 
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name 
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name IN ('conversations', 'messages');
    """)
    fks = cursor.fetchall()
    fk_map = {(r['table_name'], r['column_name']): r['foreign_table_name'] for r in fks}
    
    assert fk_map.get(('conversations', 'user_id')) == 'users', "Foreign key conversations.user_id -> users missing"
    assert fk_map.get(('conversations', 'product_id')) == 'products', "Foreign key conversations.product_id -> products missing"
    assert fk_map.get(('messages', 'conversation_id')) == 'conversations', "Foreign key messages.conversation_id -> conversations missing"
    print("✅ Foreign keys are correct.")
    
    # 3. Check unique constraint
    cursor.execute("""
        SELECT tc.constraint_name, tc.table_name, kcu.column_name 
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'UNIQUE' AND tc.table_name = 'conversations';
    """)
    unique_cols = [r['column_name'] for r in cursor.fetchall()]
    assert 'user_id' in unique_cols and 'product_id' in unique_cols, "Unique constraint on (user_id, product_id) missing"
    print("✅ Unique constraint on user_id, product_id exists.")
    
    # 4. Check indexes
    cursor.execute("SELECT indexname FROM pg_indexes WHERE tablename IN ('conversations', 'messages')")
    indexes = [r['indexname'] for r in cursor.fetchall()]
    print("Indexes found:", indexes)
    assert 'idx_conversations_user_id' in indexes, "idx_conversations_user_id missing"
    assert 'idx_conversations_product_id' in indexes, "idx_conversations_product_id missing"
    assert 'idx_messages_conversation_id' in indexes, "idx_messages_conversation_id missing"
    print("✅ Indexes are correct.")

    conn.close()
    print("Phase 1 DB structure validation passed.")

if __name__ == '__main__':
    audit_database()

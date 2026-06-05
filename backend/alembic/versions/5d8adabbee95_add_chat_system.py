"""add_chat_system

Revision ID: 5d8adabbee95
Revises: b8c77f346216
Create Date: 2026-05-30 17:38:09.212000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5d8adabbee95'
down_revision: Union[str, Sequence[str], None] = 'b8c77f346216'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    
    # 1. Create conversations table
    op.execute("""
        CREATE TABLE IF NOT EXISTS conversations (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid REFERENCES auth.users(id),
            product_id uuid REFERENCES products(id),
            status varchar(50) DEFAULT 'active',
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now(),
            UNIQUE(user_id, product_id)
        );
    """)

    # 2. Create messages table
    op.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
            sender_type varchar(50) NOT NULL,
            message text NOT NULL,
            status varchar(50) DEFAULT 'sent',
            is_read boolean DEFAULT false,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
        );
    """)

    # 3. Create Indexes
    op.execute("CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);")
    op.execute("CREATE INDEX IF NOT EXISTS idx_conversations_product_id ON conversations(product_id);")
    op.execute("CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);")
    op.execute("CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);")

    # 4. Enable RLS
    op.execute("ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE messages ENABLE ROW LEVEL SECURITY;")

    # 5. RLS Policies for conversations
    op.execute("""
        CREATE POLICY "users_read_own_conversations" ON conversations 
        FOR SELECT USING (user_id = auth.uid());
    """)
    op.execute("""
        CREATE POLICY "users_insert_own_conversations" ON conversations 
        FOR INSERT WITH CHECK (user_id = auth.uid());
    """)
    op.execute("""
        CREATE POLICY "users_update_own_conversations" ON conversations 
        FOR UPDATE USING (user_id = auth.uid());
    """)
    op.execute("""
        CREATE POLICY "admin_all_conversations" ON conversations 
        FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true));
    """)

    # 6. RLS Policies for messages
    op.execute("""
        CREATE POLICY "users_read_own_messages" ON messages 
        FOR SELECT USING (
            EXISTS (SELECT 1 FROM conversations WHERE id = messages.conversation_id AND user_id = auth.uid())
        );
    """)
    op.execute("""
        CREATE POLICY "users_insert_own_messages" ON messages 
        FOR INSERT WITH CHECK (
            EXISTS (SELECT 1 FROM conversations WHERE id = messages.conversation_id AND user_id = auth.uid())
        );
    """)
    op.execute("""
        CREATE POLICY "users_update_own_messages" ON messages 
        FOR UPDATE USING (
            EXISTS (SELECT 1 FROM conversations WHERE id = messages.conversation_id AND user_id = auth.uid())
        );
    """)
    op.execute("""
        CREATE POLICY "admin_all_messages" ON messages 
        FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true));
    """)


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DROP TABLE IF EXISTS messages CASCADE;")
    op.execute("DROP TABLE IF EXISTS conversations CASCADE;")

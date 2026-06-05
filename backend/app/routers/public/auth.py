from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from app.database import get_db
from passlib.context import CryptContext
from app.auth import create_access_token
from app.config import settings
from datetime import timedelta
import uuid

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Secret invite code sourced from settings (set ADMIN_INVITE_CODE in .env to override)
ADMIN_INVITE_CODE = settings.ADMIN_INVITE_CODE

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    invite_code: str

class ChatRegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str


@router.post("/admin/login")
def login(creds: LoginRequest, db: tuple = Depends(get_db)):
    conn, cursor = db
    try:
        # First try to find user in auth.users (Supabase auth schema)
        try:
            cursor.execute(
                "SELECT id, encrypted_password FROM auth.users WHERE email = %s",
                (creds.email,)
            )
            user = cursor.fetchone()
        except Exception:
            conn.rollback()
            user = None

        if not user or not user.get('encrypted_password'):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # Verify password (Supabase uses bcrypt)
        pwd_hash = user['encrypted_password']
        try:
            verified = pwd_context.verify(creds.password, pwd_hash)
        except Exception:
            verified = False

        if not verified:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # Check admin_users table
        cursor.execute(
            "SELECT * FROM admin_users WHERE id = %s AND is_active = true",
            (user['id'],)
        )
        admin = cursor.fetchone()

        if not admin:
            raise HTTPException(status_code=403, detail="Not an admin user. Contact super admin.")

        access_token = create_access_token(
            data={"sub": str(user['id'])}, expires_delta=timedelta(days=1)
        )
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "admin": {
                "email": admin["email"],
                "full_name": admin.get("full_name", ""),
                "role": admin.get("role", "admin"),
            }
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")


@router.post("/admin/register")
def register_admin(data: RegisterRequest, db: tuple = Depends(get_db)):
    conn, cursor = db
    try:
        # Validate invite code
        if data.invite_code != ADMIN_INVITE_CODE:
            raise HTTPException(status_code=403, detail="Invalid invite code")

        # Check if email already exists in auth.users
        try:
            cursor.execute(
                "SELECT id FROM auth.users WHERE email = %s",
                (data.email,)
            )
            existing_auth = cursor.fetchone()
        except Exception:
            conn.rollback()
            existing_auth = None

        if existing_auth:
            # Check if already an admin
            cursor.execute(
                "SELECT id FROM admin_users WHERE id = %s",
                (existing_auth['id'],)
            )
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="Admin account already exists for this email")

            admin_id = existing_auth['id']
        else:
            # Create new user in auth.users
            hashed_password = pwd_context.hash(data.password)
            new_id = str(uuid.uuid4())
            try:
                cursor.execute(
                    """
                    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role)
                    VALUES (%s, %s, %s, NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', %s, 'authenticated', 'authenticated')
                    """,
                    (new_id, data.email, hashed_password, f'{{"full_name":"{data.full_name}"}}')
                )
                conn.commit()
                admin_id = new_id
            except Exception as e:
                conn.rollback()
                raise HTTPException(status_code=500, detail=f"Failed to create auth user: {str(e)}")

        # Insert into admin_users table
        cursor.execute(
            """
            INSERT INTO admin_users (id, email, full_name, role, is_active)
            VALUES (%s, %s, %s, 'admin', true)
            ON CONFLICT (id) DO UPDATE SET is_active = true, full_name = EXCLUDED.full_name
            """,
            (admin_id, data.email, data.full_name)
        )
        conn.commit()

        # Generate token so user is logged in right away
        access_token = create_access_token(
            data={"sub": str(admin_id)}, expires_delta=timedelta(days=1)
        )
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "admin": {
                "email": data.email,
                "full_name": data.full_name,
                "role": "admin",
            }
        }

    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Registration error: {str(e)}")


@router.post("/chat/register")
def register_chat_user(data: ChatRegisterRequest, db: tuple = Depends(get_db)):
    conn, cursor = db
    try:
        # Check if email already exists
        cursor.execute("SELECT id FROM auth.users WHERE email = %s", (data.email,))
        existing_user = cursor.fetchone()
            
        hashed_password = pwd_context.hash(data.password)
        
        if existing_user:
            # If user exists (likely stuck in unconfirmed state from before), confirm them and update password
            cursor.execute(
                """
                UPDATE auth.users 
                SET encrypted_password = %s, email_confirmed_at = COALESCE(email_confirmed_at, NOW()), updated_at = NOW()
                WHERE id = %s
                """,
                (hashed_password, existing_user['id'])
            )
            conn.commit()
            return {"status": "success", "message": "User updated successfully"}
        else:
            new_id = str(uuid.uuid4())
            cursor.execute(
                """
                INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role)
                VALUES (%s, %s, %s, NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', %s, 'authenticated', 'authenticated')
                """,
                (new_id, data.email, hashed_password, f'{{"full_name":"{data.full_name}"}}')
            )
            conn.commit()
            return {"status": "success", "message": "User created successfully"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Registration error: {str(e)}")

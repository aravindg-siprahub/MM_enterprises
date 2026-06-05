from fastapi import Header, HTTPException, Depends
from jose import JWTError, jwt
from datetime import datetime, timedelta
from app.config import settings
from app.database import get_db

ALGORITHM = "HS256"

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(days=1))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=ALGORITHM)

def get_current_admin(authorization: str = Header(...), db: tuple = Depends(get_db)):
    conn, cursor = db
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")
        
    token = authorization.replace("Bearer ", "")
    
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
            
        cursor.execute("SELECT * FROM admin_users WHERE id = %s AND is_active = true", (user_id,))
        admin = cursor.fetchone()
        
        if not admin:
            raise HTTPException(status_code=403, detail="Not an admin")
            
        return admin
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

def get_super_admin(admin: dict = Depends(get_current_admin)):
    if admin.get('role') != 'super_admin':
        raise HTTPException(status_code=403, detail="Super admin privileges required for this action")
    return admin

def get_current_user(authorization: str = Header(None), db: tuple = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")
        
    token = authorization.replace("Bearer ", "")
    conn, cursor = db
    
    try:
        from supabase import create_client
        import os
        
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            raise HTTPException(status_code=500, detail="Supabase configuration missing")
            
        supabase = create_client(supabase_url, supabase_key)
        
        # Securely verify the JWT token using Supabase Auth API
        user_response = supabase.auth.get_user(token)
        
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid token")
            
        user_id = user_response.user.id
            
        cursor.execute("SELECT id, email, raw_user_meta_data FROM auth.users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(status_code=401, detail="User not found in database")
            
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

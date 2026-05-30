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

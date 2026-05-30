import os
import uuid
import filetype
from datetime import datetime
from supabase import create_client, Client
from fastapi import HTTPException
from dotenv import load_dotenv
import logging

logger = logging.getLogger(__name__)

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.warning("Missing Supabase credentials. Storage uploads will fail.")

# We initialize the client only if credentials exist, otherwise it crashes on startup
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

def validate_image_file(file_bytes: bytes, filename: str) -> str:
    """
    Validates file using magic numbers and returns the safe extension.
    """
    kind = filetype.guess(file_bytes)
    if kind is None:
        # Check for SVG (text-based, no standard magic number)
        if filename.lower().endswith('.svg'):
            # Basic sanity check for SVG content
            content = file_bytes[:1024].lower()
            if b"<svg" in content:
                return ".svg"
        raise HTTPException(status_code=400, detail="Invalid or unsupported file type")
        
    mime = kind.mime
    if mime not in ["image/jpeg", "image/png", "image/webp", "image/gif"]:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {mime}")
        
    ext = f".{kind.extension}"
    # Normalize extension
    if ext == ".jpg":
        ext = ".jpeg" # Or keep .jpg
    return ext

def upload_to_supabase(bucket: str, file_bytes: bytes, original_filename: str, content_type: str) -> dict:
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not configured")
        
    ext = validate_image_file(file_bytes, original_filename)
    
    # Partition by Year/Month
    now = datetime.now()
    year_month = now.strftime("%Y/%m")
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{ext}"
    
    # Final path: YYYY/MM/uuid.ext
    storage_path = f"{year_month}/{unique_filename}"
    
    try:
        # Upload
        res = supabase.storage.from_(bucket).upload(
            file=file_bytes,
            path=storage_path,
            file_options={"content-type": content_type}
        )
        
        # Get public URL
        public_url = supabase.storage.from_(bucket).get_public_url(storage_path)
        
        # We return both the path (to save in DB) and the public URL (for preview/frontend)
        return {
            "path": storage_path,
            "url": public_url
        }
    except Exception as e:
        logger.error(f"Supabase upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to upload to storage: {str(e)}")

def delete_from_supabase(bucket: str, path: str) -> bool:
    if not supabase:
        logger.warning("Supabase client not configured, skip deletion.")
        return False
        
    try:
        # Strip any URL prefix if the user passed a full URL instead of a path
        if "http" in path and bucket in path:
            # Extract path after bucket name
            parts = path.split(f"/{bucket}/")
            if len(parts) > 1:
                path = parts[1]
                
        res = supabase.storage.from_(bucket).remove([path])
        return True
    except Exception as e:
        logger.error(f"Failed to delete {path} from Supabase: {str(e)}")
        return False

def upload_product_image(file_bytes: bytes, original_filename: str, content_type: str) -> dict:
    return upload_to_supabase("products", file_bytes, original_filename, content_type)

def upload_banner_image(file_bytes: bytes, original_filename: str, content_type: str) -> dict:
    return upload_to_supabase("banners", file_bytes, original_filename, content_type)

def upload_brand_logo(file_bytes: bytes, original_filename: str, content_type: str) -> dict:
    return upload_to_supabase("brands", file_bytes, original_filename, content_type)

def upload_icon(file_bytes: bytes, original_filename: str, content_type: str) -> dict:
    return upload_to_supabase("icons", file_bytes, original_filename, content_type)

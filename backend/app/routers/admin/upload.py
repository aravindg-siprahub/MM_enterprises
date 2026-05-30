from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Path, Request
from typing import Dict, Any
from app.auth import get_current_admin
from app.schemas.common import UploadResponse
from app.services.storage import upload_product_image, upload_banner_image, upload_brand_logo, upload_icon

router = APIRouter(dependencies=[Depends(get_current_admin)])

ALLOWED_BUCKETS = {
    "products": {"max_size": 5242880, "func": upload_product_image},
    "banners": {"max_size": 10485760, "func": upload_banner_image},
    "brands": {"max_size": 2097152, "func": upload_brand_logo},
    "icons": {"max_size": 1048576, "func": upload_icon}
}

@router.post("/upload/{bucket}", response_model=UploadResponse)
async def upload_image(request: Request, bucket: str = Path(...), file: UploadFile = File(...)):
    if bucket not in ALLOWED_BUCKETS:
        raise HTTPException(status_code=400, detail="Invalid bucket")
        
    config = ALLOWED_BUCKETS[bucket]
    file_bytes = await file.read()
    
    if len(file_bytes) > config["max_size"]:
        raise HTTPException(status_code=400, detail="File too large")
        
    try:
        # The storage service handles MIME validation and uploading
        result = config["func"](file_bytes, file.filename, file.content_type)
        return {"url": result["url"], "path": result["path"]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Storage upload failed: {str(e)}")

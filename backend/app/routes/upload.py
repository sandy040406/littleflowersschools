"""
File upload routes.
Currently saves to local disk. Will be swapped to Cloudflare R2 later.

  POST /api/upload/image  → Upload an image file
"""

import os
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from app.core.config import get_settings
from app.core.deps import require_role
from app.core import storage
from app.models.user import User, UserRole

router = APIRouter(prefix="/api/upload", tags=["File Upload"])

settings = get_settings()

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role([UserRole.admin, UserRole.teacher])),
):
    """
    Upload an image file. Returns the URL path to the uploaded image.
    Uses app.core.storage (local disk in dev, Cloudflare R2 in production).
    """
    # Validate file type
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{file.content_type}'. Allowed: {ALLOWED_IMAGE_TYPES}",
        )

    # Validate file size
    contents = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {settings.MAX_UPLOAD_SIZE_MB}MB",
        )

    # Build unique storage key and save through storage service
    key = storage.build_key("images", file.filename)
    url = storage.save_file(key, contents, file.content_type)

    return {
        "filename": os.path.basename(key),
        "url": url,
        "size": len(contents),
        "content_type": file.content_type,
    }

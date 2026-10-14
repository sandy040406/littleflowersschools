"""
Storage service — single place that knows WHERE files are stored.

Today:  local disk  (./uploads/...)
Later:  Cloudflare R2 (S3-compatible). Only this file needs to change.
"""

import os
import uuid
from datetime import datetime, timezone

from app.core.config import get_settings

settings = get_settings()

IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
VIDEO_TYPES = {"video/mp4", "video/webm", "video/quicktime"}


def detect_media_type(content_type: str | None) -> str | None:
    """Return 'image', 'video', or None if unsupported."""
    if content_type in IMAGE_TYPES:
        return "image"
    if content_type in VIDEO_TYPES:
        return "video"
    return None


def max_bytes_for(media_type: str) -> int:
    mb = settings.MAX_VIDEO_SIZE_MB if media_type == "video" else settings.MAX_UPLOAD_SIZE_MB
    return mb * 1024 * 1024


def build_key(folder: str, original_name: str | None) -> str:
    """Create a unique storage key, e.g. 'events/12/20261003_ab12cd34.jpg'."""
    ext = os.path.splitext(original_name or "")[1].lower() or ".bin"
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d")
    return f"{folder}/{stamp}_{uuid.uuid4().hex[:8]}{ext}"


def save_file(key: str, data: bytes) -> str:
    """Persist bytes under `key` and return the public URL path."""
    path = os.path.join(settings.UPLOAD_DIR, *key.split("/"))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(data)
    return public_url(key)


def delete_file(key: str) -> None:
    """Remove a stored file. Silently ignores missing files."""
    path = os.path.join(settings.UPLOAD_DIR, *key.split("/"))
    try:
        os.remove(path)
    except FileNotFoundError:
        pass


def public_url(key: str) -> str:
    return f"/uploads/{key}"

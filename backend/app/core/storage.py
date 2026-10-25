"""
Storage service — single place that knows WHERE files are stored.

Modes:
- "local": Stores files on local disk (./uploads/...) - default for development.
- "r2": Stores files in Cloudflare R2 (S3-compatible API) - for production.
"""

import os
import uuid
from datetime import datetime, timezone
from typing import Any

from app.core.config import get_settings

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
    settings = get_settings()
    mb = settings.MAX_VIDEO_SIZE_MB if media_type == "video" else settings.MAX_UPLOAD_SIZE_MB
    return mb * 1024 * 1024


def build_key(folder: str, original_name: str | None) -> str:
    """Create a unique storage key, e.g. 'events/12/20261003_ab12cd34.jpg'."""
    ext = os.path.splitext(original_name or "")[1].lower() or ".bin"
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d")
    return f"{folder.strip('/')}/{stamp}_{uuid.uuid4().hex[:8]}{ext}"


_s3_client: Any = None


def get_r2_client():
    """Lazily initialize and return boto3 S3 client configured for Cloudflare R2."""
    global _s3_client
    if _s3_client is None:
        import boto3
        from botocore.config import Config

        settings = get_settings()
        endpoint_url = f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
        _s3_client = boto3.client(
            "s3",
            endpoint_url=endpoint_url,
            aws_access_key_id=settings.R2_ACCESS_KEY_ID,
            aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
            region_name="auto",
            config=Config(signature_version="s3v4"),
        )
    return _s3_client


def public_url(key: str) -> str:
    """Return the accessible URL path for a given storage key."""
    settings = get_settings()
    if settings.STORAGE_BACKEND.lower() == "r2" and settings.R2_PUBLIC_URL:
        base = settings.R2_PUBLIC_URL.rstrip("/")
        clean_key = key.lstrip("/")
        return f"{base}/{clean_key}"
    return f"/uploads/{key.lstrip('/')}"


def save_file(key: str, data: bytes, content_type: str | None = None) -> str:
    """Persist bytes under `key` and return the public URL path."""
    settings = get_settings()
    if settings.STORAGE_BACKEND.lower() == "r2":
        client = get_r2_client()
        extra_args: dict[str, Any] = {}
        if content_type:
            extra_args["ContentType"] = content_type
        client.put_object(
            Bucket=settings.R2_BUCKET_NAME,
            Key=key,
            Body=data,
            **extra_args,
        )
        return public_url(key)

    # Local disk mode
    path = os.path.join(settings.UPLOAD_DIR, *key.split("/"))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(data)
    return public_url(key)


def delete_file(key: str) -> None:
    """Remove a stored file. Silently ignores missing files."""
    settings = get_settings()
    if settings.STORAGE_BACKEND.lower() == "r2":
        try:
            client = get_r2_client()
            client.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=key)
        except Exception:
            pass
        return

    # Local disk mode
    path = os.path.join(settings.UPLOAD_DIR, *key.split("/"))
    try:
        os.remove(path)
    except FileNotFoundError:
        pass

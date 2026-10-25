r"""
L2 Storage tests.
Tests both local disk storage and Cloudflare R2 storage backend (mocked & config).

Usage:
  .\venv\Scripts\python.exe test_storage.py
"""

import os
import sys
import unittest.mock as mock

# Ensure backend root is on path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.core.config import Settings
from app.core import storage

failures = 0


def check(name: str, cond: bool, extra: str = ""):
    global failures
    status = "PASS: " if cond else "FAIL: "
    print(status + name + (f" -> {extra}" if not cond else ""))
    if not cond:
        failures += 1


print("=" * 60)
print("RUNNING L2 STORAGE TEST SUITE (LOCAL & CLOUDFLARE R2)")
print("=" * 60)

# --- 1. Utilities and Key Generation ---
key1 = storage.build_key("events/5", "test_photo.PNG")
check("build_key creates path with folder and lower extension", key1.startswith("events/5/") and key1.endswith(".png"), key1)

check("detect_media_type detects jpeg as image", storage.detect_media_type("image/jpeg") == "image")
check("detect_media_type detects mp4 as video", storage.detect_media_type("video/mp4") == "video")
check("detect_media_type rejects text/plain", storage.detect_media_type("text/plain") is None)

# --- 2. Local Disk Storage End-to-End ---
test_key = "test_artifacts/sample.txt"
payload = b"Hello Little Flowers School"
url = storage.save_file(test_key, payload, "text/plain")
check("local save_file returns /uploads/ URL", url == f"/uploads/{test_key}", url)

settings = storage.get_settings()
expected_local_path = os.path.join(settings.UPLOAD_DIR, *test_key.split("/"))
check("local file actually exists on disk", os.path.isfile(expected_local_path), expected_local_path)

if os.path.isfile(expected_local_path):
    with open(expected_local_path, "rb") as f:
        read_back = f.read()
    check("local file content matches original bytes", read_back == payload)

storage.delete_file(test_key)
check("local delete_file removes file from disk", not os.path.isfile(expected_local_path), expected_local_path)

# --- 3. Production Configuration Validation for R2 ---
STRONG = dict(
    ENVIRONMENT="production",
    SECRET_KEY="x" * 48,
    ADMIN_PASSWORD="Str0ng-Admin-Pass!",
    FRONTEND_URL="https://www.littleflowersschools.com",
)

# In production with STORAGE_BACKEND="local", validation passes (allows local if specified)
s_prod_local = Settings(_env_file=None, STORAGE_BACKEND="local", **STRONG)
try:
    s_prod_local.validate_for_production()
    check("production: STORAGE_BACKEND=local passes validation", True)
except Exception as e:
    check("production: STORAGE_BACKEND=local passes validation", False, str(e))

# In production with STORAGE_BACKEND="r2" but empty credentials, validation must raise
s_prod_r2_bad = Settings(_env_file=None, STORAGE_BACKEND="r2", **STRONG)
raised = False
try:
    s_prod_r2_bad.validate_for_production()
except RuntimeError as e:
    raised = "STORAGE_BACKEND is 'r2' but missing" in str(e)
check("production: STORAGE_BACKEND=r2 without credentials rejected", raised)

# In production with complete R2 credentials, validation passes
s_prod_r2_ok = Settings(
    _env_file=None,
    STORAGE_BACKEND="r2",
    R2_ACCOUNT_ID="acc123456",
    R2_ACCESS_KEY_ID="key123",
    R2_SECRET_ACCESS_KEY="sec123",
    R2_BUCKET_NAME="littleflowers-media",
    R2_PUBLIC_URL="https://media.littleflowersschools.com",
    **STRONG,
)
try:
    s_prod_r2_ok.validate_for_production()
    check("production: complete R2 credentials accepted", True)
except Exception as e:
    check("production: complete R2 credentials accepted", False, str(e))

# --- 4. Cloudflare R2 Mocked Operations ---
r2_settings = Settings(
    _env_file=None,
    STORAGE_BACKEND="r2",
    R2_ACCOUNT_ID="mock_acc",
    R2_ACCESS_KEY_ID="mock_key",
    R2_SECRET_ACCESS_KEY="mock_sec",
    R2_BUCKET_NAME="littleflowers-media",
    R2_PUBLIC_URL="https://media.littleflowersschools.com",
)

with mock.patch("app.core.storage.get_settings", return_value=r2_settings):
    # Test public URL formatting
    r2_url = storage.public_url("gallery/photo1.jpg")
    check(
        "R2 public_url prepends custom public URL",
        r2_url == "https://media.littleflowersschools.com/gallery/photo1.jpg",
        r2_url,
    )

    # Test save_file calling S3 put_object
    mock_s3 = mock.MagicMock()
    with mock.patch("app.core.storage.get_r2_client", return_value=mock_s3):
        saved_url = storage.save_file("gallery/photo1.jpg", b"\x89PNGfake", "image/png")
        check("R2 save_file returns public URL", saved_url == "https://media.littleflowersschools.com/gallery/photo1.jpg")
        mock_s3.put_object.assert_called_once_with(
            Bucket="littleflowers-media",
            Key="gallery/photo1.jpg",
            Body=b"\x89PNGfake",
            ContentType="image/png",
        )
        check("R2 put_object called with correct bucket, key, and content type", True)

        # Test delete_file calling S3 delete_object
        storage.delete_file("gallery/photo1.jpg")
        mock_s3.delete_object.assert_called_once_with(
            Bucket="littleflowers-media",
            Key="gallery/photo1.jpg",
        )
        check("R2 delete_object called with correct bucket and key", True)

print("=" * 60)
if failures == 0:
    print("ALL L2 STORAGE TESTS PASSED!")
    sys.exit(0)
else:
    print(f"FAILED: {failures} test(s) failed.")
    sys.exit(1)

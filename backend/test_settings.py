"""
test_settings.py - Automated tests for Module M8 (Editable Site Settings & Content)
Usage: python test_settings.py [base_url]
"""

import json
import sys
import urllib.error
import urllib.request

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"

def call(method, path, body=None, token=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(BASE + path, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read() or b"null")
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b"null")
    except Exception as e:
        return 0, str(e)

def check(name, cond, extra=""):
    print(("PASS: " if cond else "FAIL: ") + name + (f"  -> {extra}" if not cond else ""))
    return cond

def test_settings_flow():
    ok = True
    print("\n--- 1. Testing GET /api/content/settings (Public) ---")
    status, data = call("GET", "/api/content/settings")
    ok &= check("public settings get", status == 200, f"status={status}, resp={data}")
    if status == 200:
        ok &= check("school_name in response", "school_name" in data, data)
        ok &= check("phone in response", "phone" in data, data)
        ok &= check("about_text in response", "about_text" in data, data)

    print("\n--- 2. Testing PUT /api/content/settings without auth (Expect 401/403) ---")
    status, data = call("PUT", "/api/content/settings", {"school_name": "Unauthorized School"})
    ok &= check("unauth PUT rejected with 401 or 403", status in (401, 403), f"status={status}")

    print("\n--- 3. Testing Admin Login ---")
    status, tok = call("POST", "/api/auth/login/admin", {
        "email": "admin@littleflowersschools.com",
        "password": "admin123"
    })
    ok &= check("admin login succeeds", status == 200, tok)
    admin_token = tok.get("access_token") if status == 200 else None

    if admin_token:
        print("\n--- 4. Testing Admin PUT /api/content/settings ---")
        payload = {
            "school_name": "Little Flowers Higher Secondary School",
            "tagline": "Growing Curious Minds. Building Confident Futures.",
            "phone": "+91 11 2345 6789",
            "email": "info@littleflowersschools.com",
            "address": "123 Education Lane, New Delhi, India 110001",
            "about_text": "Little Flowers Schools has been nurturing future leaders since 1995 with academic excellence and holistic development.",
            "vision_text": "To be a center of educational excellence that nurtures the holistic development of every child.",
            "mission_text": "To provide a stimulating learning environment that encourages curiosity and lifelong learning."
        }
        status, updated = call("PUT", "/api/content/settings", payload, token=admin_token)
        ok &= check("admin PUT succeeds with 200", status == 200, f"status={status}, resp={updated}")
        if status == 200:
            ok &= check("school_name updated", updated.get("school_name") == payload["school_name"])
            ok &= check("about_text updated", updated.get("about_text") == payload["about_text"])

        print("\n--- 5. Verifying Public GET reflects newly saved settings ---")
        status, public_data = call("GET", "/api/content/settings")
        ok &= check("public GET returns 200", status == 200)
        if status == 200:
            ok &= check("public GET has updated school_name", public_data.get("school_name") == payload["school_name"])
            ok &= check("public GET has updated about_text", public_data.get("about_text") == payload["about_text"])

    print("\n" + ("=== ALL M8 TESTS PASSED! ===" if ok else "=== SOME M8 TESTS FAILED! ==="))
    if not ok:
        sys.exit(1)

if __name__ == "__main__":
    test_settings_flow()

r"""
L1 security tests.

1) Config rules (no server needed):
   .\venv\Scripts\python.exe test_security.py

2) Live checks (headers + login rate limit) against a THROWAWAY server started with
   a small login limit, e.g.:
     $env:LOGIN_RATE_LIMIT="5"; .\venv\Scripts\python.exe -m uvicorn app.main:app --port 8001
   then:
     .\venv\Scripts\python.exe test_security.py http://localhost:8001
   (the login limit locks out the calling IP for the window, so don't run this
   against the server you're using in the browser)
"""

import json
import sys
import urllib.error
import urllib.request

from app.core.config import Settings

failures = 0


def check(name, cond, extra=""):
    global failures
    print(("PASS " if cond else "FAIL ") + name + (f"  -> {extra}" if not cond else ""))
    if not cond:
        failures += 1


# ── 1. Config rules ─────────────────────────────────────────

STRONG = dict(
    ENVIRONMENT="production",
    SECRET_KEY="x" * 48,
    ADMIN_PASSWORD="Str0ng-Admin-Pass!",
    FRONTEND_URL="https://www.littleflowersschools.com",
)


def raises(**overrides):
    try:
        Settings(_env_file=None, **{**STRONG, **overrides}).validate_for_production()
        return False
    except RuntimeError:
        return True


check("production: strong config accepted", not raises())
check("production: default SECRET_KEY rejected", raises(SECRET_KEY="change-me"))
check("production: short SECRET_KEY rejected", raises(SECRET_KEY="short"))
check("production: default admin password rejected", raises(ADMIN_PASSWORD="admin123"))
check("production: short admin password rejected", raises(ADMIN_PASSWORD="abc123"))
check("production: localhost FRONTEND_URL rejected", raises(FRONTEND_URL="http://localhost:3000"))

dev = Settings(_env_file=None, ENVIRONMENT="development")
try:
    dev.validate_for_production()
    check("development: weak defaults allowed", True)
except RuntimeError as e:
    check("development: weak defaults allowed", False, e)

prod = Settings(_env_file=None, **STRONG, CORS_ORIGINS="https://littleflowersschools.com/, https://x.example")
check("production CORS excludes localhost", not any("localhost" in o for o in prod.allowed_origins), prod.allowed_origins)
check(
    "production CORS includes configured origins",
    prod.allowed_origins == [
        "https://www.littleflowersschools.com",
        "https://littleflowersschools.com",
        "https://x.example",
    ],
    prod.allowed_origins,
)
check("development CORS includes localhost", "http://localhost:3000" in dev.allowed_origins, dev.allowed_origins)

# ── 2. Live checks (optional) ───────────────────────────────

if len(sys.argv) > 1:
    BASE = sys.argv[1]

    def post(path, body):
        req = urllib.request.Request(BASE + path, data=json.dumps(body).encode(), method="POST")
        req.add_header("Content-Type", "application/json")
        try:
            with urllib.request.urlopen(req) as r:
                return r.status, dict(r.headers)
        except urllib.error.HTTPError as e:
            return e.code, dict(e.headers)

    with urllib.request.urlopen(BASE + "/api/health") as r:
        h = {k.lower(): v for k, v in r.headers.items()}
    check("header X-Content-Type-Options", h.get("x-content-type-options") == "nosniff", h)
    check("header X-Frame-Options", h.get("x-frame-options") == "DENY", h)
    check("header Referrer-Policy", "referrer-policy" in h, h)

    statuses = []
    for _ in range(60):
        s, hdrs = post("/api/auth/login/admin", {"email": "nobody@example.com", "password": "wrong-password"})
        statuses.append(s)
        if s == 429:
            check("429 sends Retry-After", any(k.lower() == "retry-after" for k in hdrs), hdrs)
            break
    check("wrong logins are 401 then 429", statuses[0] == 401 and 429 in statuses, statuses[-5:])

print("\nALL PASSED" if failures == 0 else f"\n{failures} TEST(S) FAILED")
sys.exit(0 if failures == 0 else 1)

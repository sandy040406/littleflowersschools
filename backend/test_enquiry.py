"""End-to-end test for the enquiry API. Usage: python test_enquiry.py [base_url] [admin_password]"""
import json
import sys
import urllib.request
import urllib.error

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8001"
PWD = sys.argv[2] if len(sys.argv) > 2 else "admin123"


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


def check(name, cond, extra=""):
    print(("PASS " if cond else "FAIL ") + name + (f"  -> {extra}" if not cond else ""))
    return cond


ok = True
s, created = call("POST", "/api/enquiries", {
    "parent_name": "Test Parent", "email": "Test@Example.com", "phone": "+91 98765 43210",
    "student_name": "Kid", "grade_interested": "Class I", "preferred_contact": "whatsapp", "message": "hi",
})
ok &= check("public create 201", s == 201, created)
ok &= check("email lowercased", created and created.get("email") == "test@example.com", created)

s, r = call("POST", "/api/enquiries", {"parent_name": "AB", "email": "bad", "phone": "1"})
ok &= check("invalid email rejected 422", s == 422, r)

s, r = call("POST", "/api/enquiries", {"parent_name": "Bot", "email": "a@b.co", "phone": "9876543210", "website": "spam"})
ok &= check("honeypot rejected 400", s == 400, r)

s, r = call("GET", "/api/enquiries")
ok &= check("list requires auth", s in (401, 403), r)

s, tok = call("POST", "/api/auth/login/admin", {"email": "admin@littleflowersschools.com", "password": PWD})
ok &= check("admin login", s == 200, tok)
token = tok.get("access_token") if s == 200 else None

if token:
    s, lst = call("GET", "/api/enquiries", token=token)
    ok &= check("admin list", s == 200 and any(e["id"] == created["id"] for e in lst), s)

    s, lst = call("GET", "/api/enquiries?status=new", token=token)
    ok &= check("filter status=new", s == 200 and all(e["status"] == "new" for e in lst), s)

    s, st = call("GET", "/api/enquiries/stats", token=token)
    ok &= check("stats", s == 200 and st["total"] >= 1, st)

    s, upd = call("PUT", f"/api/enquiries/{created['id']}", {"status": "contacted", "admin_notes": "Called"}, token=token)
    ok &= check("update status+notes", s == 200 and upd["status"] == "contacted" and upd["admin_notes"] == "Called", upd)

    s, r = call("DELETE", f"/api/enquiries/{created['id']}", token=token)
    ok &= check("delete", s == 200, r)

    s, r = call("DELETE", f"/api/enquiries/{created['id']}", token=token)
    ok &= check("delete again 404", s == 404, r)

    # Test Contact Message API
    s, contact_created = call("POST", "/api/contact", {
        "name": "Jane Visitor",
        "email": "jane@example.com",
        "phone": "+91 91234 56789",
        "subject": "General Inquiry",
        "message": "Hello, I would like to know more about the school campus.",
    })
    ok &= check("contact create 201", s == 201, contact_created)
    ok &= check("contact enquiry_type", contact_created and contact_created.get("enquiry_type") == "contact", contact_created)

    s, bot_res = call("POST", "/api/contact", {
        "name": "Spam Bot",
        "email": "bot@spam.com",
        "phone": "9999999999",
        "message": "Buy crypto now!",
        "website": "http://spamsite.com",
    })
    ok &= check("contact honeypot rejected 400", s == 400, bot_res)

    s, contact_list = call("GET", "/api/enquiries?enquiry_type=contact", token=token)
    ok &= check("filter enquiry_type=contact", s == 200 and any(e["id"] == contact_created["id"] for e in contact_list), contact_list)

    if contact_created:
        call("DELETE", f"/api/enquiries/{contact_created['id']}", token=token)

# Opt-in: flood the public endpoint until it returns 429. This locks out the
# calling IP for the whole window, so only run it against a throwaway server:
#   python test_enquiry.py http://localhost:8001 admin123 --ratelimit
if "--ratelimit" in sys.argv:
    statuses = []
    for _ in range(50):
        # Valid payload shape with honeypot tripped: passes schema validation,
        # counts against the rate limit, and stores nothing in the DB.
        s, _r = call("POST", "/api/enquiries", {"parent_name": "Bot", "email": "a@b.co", "phone": "9876543210", "website": "spam"})
        statuses.append(s)
        if s == 429:
            break
    ok &= check("rate limit returns 429", 429 in statuses, statuses[-5:])

print("\nALL PASSED" if ok else "\nSOME TESTS FAILED")
sys.exit(0 if ok else 1)

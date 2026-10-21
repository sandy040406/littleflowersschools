"""
test_parent_portal.py - Automated tests for Module M9 (Parent Portal & Multi-child Completeness)
Usage: python test_parent_portal.py [base_url]
"""

import json
import sys
import time
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
        body = e.read()
        try:
            return e.code, json.loads(body or b"null")
        except Exception:
            return e.code, body.decode(errors="ignore")
    except Exception as e:
        return 0, str(e)

def check(name, cond, extra=""):
    print(("PASS: " if cond else "FAIL: ") + name + (f"  -> {extra}" if not cond else ""))
    return cond

def test_parent_portal_flow():
    ok = True
    suffix = str(int(time.time()))[-4:]
    adm1 = f"ADM-P1-{suffix}"
    adm2 = f"ADM-P2-{suffix}"
    parent_email = f"parent.{suffix}@testschool.com"
    parent_phone = f"+9198{suffix}1234"

    print("\n--- 1. Admin Login ---")
    status, tok = call("POST", "/api/auth/login/admin", {
        "email": "admin@littleflowersschools.com",
        "password": "admin123"
    })
    ok &= check("admin login succeeds", status == 200, tok)
    admin_token = tok.get("access_token") if status == 200 else None

    if not admin_token:
        print("Cannot continue without admin login.")
        sys.exit(1)

    print("\n--- 2. Admin creates First Child for Parent ---")
    child1_payload = {
        "name": f"First Child {suffix}",
        "admission_number": adm1,
        "date_of_birth": "2015-03-15",
        "class_name": "Class IV",
        "section": "A",
        "roll_number": "14",
        "parent_name": f"Parent Verma {suffix}",
        "parent_phone": parent_phone,
        "parent_email": parent_email,
    }
    status, res1 = call("POST", "/api/admin/students", child1_payload, token=admin_token)
    ok &= check("admin creates child 1", status == 201, f"status={status}, res={res1}")

    print("\n--- 3. Admin creates Second Child for Same Parent (Sibling) ---")
    child2_payload = {
        "name": f"Second Child {suffix}",
        "admission_number": adm2,
        "date_of_birth": "2018-07-20",
        "class_name": "Class I",
        "section": "B",
        "roll_number": "06",
        "parent_name": f"Parent Verma {suffix}",
        "parent_phone": parent_phone,
        "parent_email": parent_email,
    }
    status, res2 = call("POST", "/api/admin/students", child2_payload, token=admin_token)
    ok &= check("admin creates sibling child 2 linked to same parent", status == 201, f"status={status}, res={res2}")

    print("\n--- 4. Parent Login using Child 1 admission + DOB ---")
    status, p_tok1 = call("POST", "/api/auth/login/parent", {
        "admission_number": adm1,
        "date_of_birth": "2015-03-15",
    })
    ok &= check("parent login with child 1 adm + DOB succeeds", status == 200, p_tok1)
    p_token1 = p_tok1.get("access_token") if status == 200 else None

    print("\n--- 5. Verify /api/auth/me/children returns BOTH children ---")
    if p_token1:
        status, kids = call("GET", "/api/auth/me/children", token=p_token1)
        ok &= check("GET /api/auth/me/children succeeds with 200", status == 200, kids)
        if status == 200 and isinstance(kids, list):
            ok &= check("parent has at least 2 children returned", len(kids) >= 2, f"count={len(kids)}")
            adm_list = [k.get("admission_number") for k in kids]
            ok &= check("child 1 in children list", adm1 in adm_list, adm_list)
            ok &= check("child 2 in children list", adm2 in adm_list, adm_list)
            
            # Check fields
            c1 = next((k for k in kids if k.get("admission_number") == adm1), None)
            if c1:
                ok &= check("child 1 has date_of_birth", c1.get("date_of_birth") == "2015-03-15", c1)
                ok &= check("child 1 has class_name", c1.get("class_name") == "Class IV", c1)

    print("\n--- 6. Parent Login using Child 2 admission + DOB ---")
    status, p_tok2 = call("POST", "/api/auth/login/parent", {
        "admission_number": adm2,
        "date_of_birth": "2018-07-20",
    })
    ok &= check("parent login with child 2 adm + DOB succeeds", status == 200, p_tok2)

    print("\n--- 7. Parent Sets / Changes Password ---")
    new_pw = "SecureParentPass123"
    if p_token1:
        status, pw_res = call("POST", "/api/auth/change-password", {
            "current_password": "2015-03-15",
            "new_password": new_pw
        }, token=p_token1)
        ok &= check("parent sets new password", status == 200, pw_res)

        print("\n--- 8. Parent Login with Child 1 ADM + new custom password ---")
        status, p_tok_pw1 = call("POST", "/api/auth/login/parent", {
            "admission_number": adm1,
            "password": new_pw
        })
        ok &= check("login with child 1 adm + custom password succeeds", status == 200, p_tok_pw1)

        print("\n--- 9. Parent Login with Child 2 ADM + new custom password ---")
        status, p_tok_pw2 = call("POST", "/api/auth/login/parent", {
            "admission_number": adm2,
            "password": new_pw
        })
        ok &= check("login with child 2 adm + custom password succeeds", status == 200, p_tok_pw2)

    print("\n" + ("=== ALL M9 TESTS PASSED! ===" if ok else "=== SOME M9 TESTS FAILED! ==="))
    if not ok:
        sys.exit(1)

if __name__ == "__main__":
    test_parent_portal_flow()

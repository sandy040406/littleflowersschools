"""End-to-end test for M5 (password management). Usage: python test_password.py [base_url] [admin_password]

Creates a throwaway teacher + student/parent and removes them from the local
SQLite DB afterwards.
"""
import json
import os
import sqlite3
import sys
import time
import urllib.error
import urllib.request

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"
PWD = sys.argv[2] if len(sys.argv) > 2 else "admin123"
DB = os.path.join(os.path.dirname(__file__), "app.db")


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
tag = str(int(time.time()))[-6:]
adm_no, dob = f"T{tag}", "2015-05-05"
t_email = f"pwtest{tag}@example.com"

s, tok = call("POST", "/api/auth/login/admin", {"email": "admin@littleflowersschools.com", "password": PWD})
ok &= check("admin login", s == 200, tok)
admin = tok["access_token"]

try:
    # --- setup -------------------------------------------------------------
    s, r = call("POST", "/api/admin/students", {
        "name": "PW Kid", "admission_number": adm_no, "date_of_birth": dob,
        "class_name": "Class I", "parent_name": "PW Parent",
    }, token=admin)
    ok &= check("create student+parent", s == 201, r)
    s, r = call("POST", "/api/admin/teachers", {
        "name": "PW Teacher", "email": t_email, "password": "oldpass123",
    }, token=admin)
    ok &= check("create teacher", s == 201, r)
    teacher_id = r["id"]

    # --- parent first login + forced change --------------------------------
    s, p = call("POST", "/api/auth/login/parent", {"admission_number": adm_no, "date_of_birth": dob})
    ok &= check("parent DOB login", s == 200, p)
    ok &= check("parent must change password", p.get("must_change_password") is True, p)
    ptoken, parent_id = p["access_token"], p["user_id"]

    s, r = call("POST", "/api/auth/change-password", {"current_password": "wrong-one", "new_password": "newpass123"}, token=ptoken)
    ok &= check("wrong current password rejected", s == 400, r)
    s, r = call("POST", "/api/auth/change-password", {"current_password": dob, "new_password": "short"}, token=ptoken)
    ok &= check("short password rejected 422", s == 422, r)
    s, r = call("POST", "/api/auth/change-password", {"current_password": dob, "new_password": dob}, token=ptoken)
    ok &= check("new == current rejected", s == 400, r)

    s, r = call("POST", "/api/auth/change-password", {"current_password": dob, "new_password": "parentpass1"}, token=ptoken)
    ok &= check("parent change password", s == 200 and r["must_change_password"] is False, r)

    s, r = call("POST", "/api/auth/login/parent", {"admission_number": adm_no, "date_of_birth": dob})
    ok &= check("DOB login rejected after change", s == 401, r)
    s, r = call("POST", "/api/auth/login/parent", {"admission_number": adm_no, "password": "parentpass1"})
    ok &= check("parent password login", s == 200 and r["must_change_password"] is False, r)

    # --- admin reset: parent -----------------------------------------------
    s, r = call("POST", f"/api/admin/users/{parent_id}/reset-password", {}, token=admin)
    ok &= check("admin reset parent", s == 200 and r["temporary_password"] is None, r)
    s, r = call("POST", "/api/auth/login/parent", {"admission_number": adm_no, "date_of_birth": dob})
    ok &= check("parent DOB login works after reset + forced", s == 200 and r["must_change_password"] is True, r)

    # --- teacher: reset, forced change, change ------------------------------
    s, r = call("POST", f"/api/admin/users/{teacher_id}/reset-password", {}, token=admin)
    temp = r.get("temporary_password") if s == 200 else None
    ok &= check("admin reset teacher returns temp password", s == 200 and bool(temp), r)
    s, r = call("POST", "/api/auth/login/admin", {"email": t_email, "password": "oldpass123"})
    ok &= check("old teacher password invalid", s == 401, r)
    s, t = call("POST", "/api/auth/login/admin", {"email": t_email, "password": temp})
    ok &= check("teacher temp login forced change", s == 200 and t["must_change_password"] is True, t)
    s, r = call("POST", "/api/auth/change-password", {"current_password": temp, "new_password": "teacherpass1"}, token=t["access_token"])
    ok &= check("teacher change password", s == 200 and r["must_change_password"] is False, r)
    s, r = call("POST", "/api/auth/login/admin", {"email": t_email, "password": "teacherpass1"})
    ok &= check("teacher new password login", s == 200 and r["must_change_password"] is False, r)

    # --- permissions --------------------------------------------------------
    s, r = call("POST", f"/api/admin/users/{teacher_id}/reset-password", {}, token=r["access_token"])
    ok &= check("teacher cannot reset passwords", s == 403, r)
    s, me = call("GET", "/api/auth/me", token=admin)
    s, r = call("POST", f"/api/admin/users/{me['id']}/reset-password", {}, token=admin)
    ok &= check("admin cannot reset self", s == 400, r)
finally:
    conn = sqlite3.connect(DB)
    conn.execute("DELETE FROM students WHERE admission_number = ?", (adm_no,))
    conn.execute("DELETE FROM users WHERE admission_number = ? OR email = ?", (adm_no, t_email))
    conn.commit()
    conn.close()

print("\nALL PASSED" if ok else "\nSOME TESTS FAILED")
sys.exit(0 if ok else 1)

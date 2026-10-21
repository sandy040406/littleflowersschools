"""
test_admin_tools.py - Comprehensive automated tests for Module M10 (Admin Dashboard & User Tools)
Usage: python test_admin_tools.py [base_url]
"""

import json
import secrets
import sys
import time
import urllib.error
import urllib.request

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"


def call(method, path, body=None, token=None, custom_headers=None):
    if custom_headers and "Content-Type" in custom_headers:
        data = body
    else:
        data = json.dumps(body).encode("utf-8") if body is not None else None

    req = urllib.request.Request(BASE + path, data=data, method=method)
    if custom_headers:
        for k, v in custom_headers.items():
            req.add_header(k, v)
    elif data is not None:
        req.add_header("Content-Type", "application/json")

    if token:
        req.add_header("Authorization", f"Bearer {token}")

    try:
        with urllib.request.urlopen(req) as r:
            raw = r.read()
            return r.status, json.loads(raw or b"null")
    except urllib.error.HTTPError as e:
        raw = e.read()
        try:
            return e.code, json.loads(raw or b"null")
        except Exception:
            return e.code, raw.decode(errors="ignore")
    except Exception as e:
        return 0, str(e)


def check(name, cond, extra=""):
    status = "PASS: " if cond else "FAIL: "
    print(status + name + (f" -> {extra}" if not cond else ""))
    return cond


def make_multipart(field_name, filename, file_content, content_type="text/csv"):
    boundary = "----WebKitFormBoundary" + secrets.token_hex(8)
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="{field_name}"; filename="{filename}"\r\n'
        f"Content-Type: {content_type}\r\n\r\n"
        f"{file_content}\r\n"
        f"--{boundary}--\r\n"
    ).encode("utf-8")
    header = {"Content-Type": f"multipart/form-data; boundary={boundary}"}
    return body, header


def test_admin_tools():
    ok = True
    suffix = str(int(time.time()))[-4:]

    print("\n--- 1. Admin Authentication ---")
    status, tok = call("POST", "/api/auth/login/admin", {
        "email": "admin@littleflowersschools.com",
        "password": "admin123"
    })
    ok &= check("Admin login succeeds", status == 200, tok)
    admin_token = tok.get("access_token") if status == 200 else None
    if not admin_token:
        print("Fatal: Could not authenticate admin.")
        sys.exit(1)

    print("\n--- 2. Enriched System Stats ---")
    status, stats = call("GET", "/api/admin/stats", token=admin_token)
    ok &= check("GET /api/admin/stats returns 200", status == 200, stats)
    ok &= check("Stats contains total_students", "total_students" in stats, stats)
    ok &= check("Stats contains active_students", "active_students" in stats, stats)
    ok &= check("Stats contains classes breakdown", "classes" in stats and isinstance(stats["classes"], list), stats)

    print("\n--- 3. System Activity Feed ---")
    status, activity = call("GET", "/api/admin/activity", token=admin_token)
    ok &= check("GET /api/admin/activity returns 200", status == 200, activity)
    ok &= check("Activity returns list", isinstance(activity, list), activity)

    print("\n--- 4. Student Creation & List & Search ---")
    adm = f"ADM-M10-{suffix}"
    status, st_res = call("POST", "/api/admin/students", {
        "name": f"M10 Student {suffix}",
        "admission_number": adm,
        "date_of_birth": "2016-04-12",
        "class_name": "Class IX",
        "section": "A",
        "roll_number": "101",
        "parent_name": f"M10 Parent {suffix}",
        "parent_email": f"m10parent.{suffix}@test.com",
        "parent_phone": f"+9198{suffix}9999"
    }, token=admin_token)
    ok &= check("POST /api/admin/students creates student", status == 201, st_res)

    status, s_list = call("GET", f"/api/admin/students?search={adm}", token=admin_token)
    ok &= check("GET /api/admin/students search finds student", status == 200 and len(s_list) > 0, s_list)
    target = next((s for s in s_list if s["admission_number"] == adm), None)
    ok &= check("Target student found in search", target is not None)
    student_id = target["id"] if target else None

    if student_id:
        print("\n--- 5. Get and Update Student ---")
        status, s_detail = call("GET", f"/api/admin/students/{student_id}", token=admin_token)
        ok &= check("GET /api/admin/students/{id} returns 200", status == 200, s_detail)

        status, s_upd = call("PUT", f"/api/admin/students/{student_id}", {
            "roll_number": "105-UPDATED",
            "section": "B"
        }, token=admin_token)
        ok &= check("PUT /api/admin/students/{id} updates student", status == 200 and s_upd["roll_number"] == "105-UPDATED", s_upd)

        print("\n--- 6. Deactivate and Reactivate Student ---")
        status, deact = call("DELETE", f"/api/admin/students/{student_id}", token=admin_token)
        ok &= check("DELETE /api/admin/students/{id} deactivates student", status == 200, deact)

        status, s_deact = call("GET", f"/api/admin/students/{student_id}", token=admin_token)
        ok &= check("Student is inactive", status == 200 and s_deact["is_active"] is False)

        status, react = call("PUT", f"/api/admin/students/{student_id}/activate", token=admin_token)
        ok &= check("PUT /api/admin/students/{id}/activate reactivates student", status == 200, react)

        status, s_act = call("GET", f"/api/admin/students/{student_id}", token=admin_token)
        ok &= check("Student is active again", status == 200 and s_act["is_active"] is True)

    print("\n--- 7. Class Batch Promotion ---")
    status, prom = call("POST", "/api/admin/students/promote", {
        "from_class": "Class IX",
        "to_class": "Class X",
        "from_section": "B",
        "to_section": "A"
    }, token=admin_token)
    ok &= check("POST /api/admin/students/promote succeeds", status == 200, prom)
    ok &= check("Promotion returns count", "promoted_count" in prom, prom)

    if student_id:
        status, s_check = call("GET", f"/api/admin/students/{student_id}", token=admin_token)
        ok &= check("Student promoted to Class X", status == 200 and s_check["class_name"] == "Class X", s_check)

    print("\n--- 8. Bulk CSV Import ---")
    csv_str = f"""name,admission_number,date_of_birth,class_name,section,roll_number,parent_name,parent_phone,parent_email
CSV Student Alpha,CSV-{suffix}-01,2017-01-10,Class I,A,01,Parent Alpha,+9191{suffix}111,alpha.{suffix}@example.com
CSV Student Beta,CSV-{suffix}-02,15/05/2017,Class I,B,02,Parent Beta,+9192{suffix}222,beta.{suffix}@example.com
CSV Student Gamma,CSV-{suffix}-03,20-08-2016,Class II,A,03,Parent Gamma,+9193{suffix}333,gamma.{suffix}@example.com
Missing Fields Student,,2015-01-01,Class III,A,04,Parent Delta,,
"""
    body, headers = make_multipart("file", "students.csv", csv_str)
    status, imp_res = call("POST", "/api/admin/students/import-csv", body=body, token=admin_token, custom_headers=headers)
    ok &= check("POST /api/admin/students/import-csv returns 200", status == 200, imp_res)
    ok &= check("CSV created 3 valid students", imp_res.get("created") == 3, imp_res)
    ok &= check("CSV captured 1 error for missing fields", len(imp_res.get("errors", [])) == 1, imp_res)

    print("\n--- 9. Generic User Update ---")
    status, users = call("GET", "/api/admin/users", token=admin_token)
    ok &= check("GET /api/admin/users returns 200", status == 200)
    parent_user = next((u for u in users if u["role"] == "parent"), None)
    if parent_user:
        new_phone = f"+9199{suffix}8888"
        status, upd_user = call("PUT", f"/api/admin/users/{parent_user['id']}", {
            "phone": new_phone
        }, token=admin_token)
        ok &= check("PUT /api/admin/users/{id} updates user", status == 200 and upd_user["phone"] == new_phone, upd_user)

    print("\n==========================================")
    if ok:
        print("ALL M10 BACKEND TESTS PASSED!")
    else:
        print("SOME M10 BACKEND TESTS FAILED")
    print("==========================================")
    return ok


if __name__ == "__main__":
    if not test_admin_tools():
        sys.exit(1)

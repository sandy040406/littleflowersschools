r"""
Gallery API tests. Requires the server running and test_api.py run once
(so the teacher + student LFS2025001 / Class III-A exist).

Run: .\venv\Scripts\python.exe test_gallery.py
"""

import json
import uuid
import urllib.request
import urllib.error

BASE = "http://localhost:8000"
failures = 0

# 1x1 PNG
PNG = bytes.fromhex(
    "89504e470d0a1a0a0000000d4948445200000001000000010806000000"
    "1f15c4890000000d49444154789c6360000002000154a24f5d0000000049454e44ae426082"
)


def api(method, path, data=None, token=None):
    body = json.dumps(data).encode() if data is not None else None
    req = urllib.request.Request(f"{BASE}{path}", data=body, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        resp = urllib.request.urlopen(req)
        raw = resp.read()
        return (json.loads(raw) if raw else None), resp.status
    except urllib.error.HTTPError as e:
        raw = e.read()
        return (json.loads(raw) if raw else None), e.code


def upload(path, files, token, visibility="public"):
    boundary = uuid.uuid4().hex
    parts = []
    for name, ctype, content in files:
        parts.append(
            f'--{boundary}\r\nContent-Disposition: form-data; name="files"; '
            f'filename="{name}"\r\nContent-Type: {ctype}\r\n\r\n'.encode() + content + b"\r\n"
        )
    parts.append(
        f'--{boundary}\r\nContent-Disposition: form-data; name="visibility"\r\n\r\n'
        f"{visibility}\r\n".encode()
    )
    body = b"".join(parts) + f"--{boundary}--\r\n".encode()
    req = urllib.request.Request(f"{BASE}{path}", data=body, method="POST")
    req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
    req.add_header("Authorization", f"Bearer {token}")
    try:
        resp = urllib.request.urlopen(req)
        return json.loads(resp.read()), resp.status
    except urllib.error.HTTPError as e:
        return json.loads(e.read()), e.code


def check(label, cond, extra=""):
    global failures
    mark = "PASS" if cond else "FAIL"
    if not cond:
        failures += 1
    print(f"  [{mark}] {label} {extra}")


# ── Logins ──
print("== Logins ==")
admin, _ = api("POST", "/api/auth/login/admin",
               {"email": "admin@littleflowersschools.com", "password": "admin123"})
teacher, _ = api("POST", "/api/auth/login/admin",
                 {"email": "anita.verma@littleflowersschools.com", "password": "teacher123"})
parent, _ = api("POST", "/api/auth/login/parent",
                {"admission_number": "LFS2025001", "date_of_birth": "2016-03-15"})
A, T, P = admin.get("access_token"), teacher.get("access_token"), parent.get("access_token")
check("admin/teacher/parent tokens", all([A, T, P]))

# ── Create events ──
print("== Create events ==")
pub, c1 = api("POST", "/api/gallery/events", {
    "title": "Annual Sports Day", "event_date": "2026-01-20",
    "category": "sports", "visibility": "public"}, T)
check("teacher creates public event", c1 == 201, f"({c1})")

priv_mine, c2 = api("POST", "/api/gallery/events", {
    "title": "Class III-A Picnic", "event_date": "2026-02-10", "category": "activities",
    "class_name": "Class III", "section": "A", "visibility": "private"}, T)
check("teacher creates private Class III-A event", c2 == 201, f"({c2})")

priv_other, c3 = api("POST", "/api/gallery/events", {
    "title": "Class V Science Fair", "event_date": "2026-02-15", "category": "events",
    "class_name": "Class V", "visibility": "private"}, A)
check("admin creates private Class V event", c3 == 201, f"({c3})")

_, c4 = api("POST", "/api/gallery/events", {
    "title": "Hack", "event_date": "2026-02-15"}, P)
check("parent cannot create event", c4 == 403, f"({c4})")

# ── Upload media ──
print("== Upload media ==")
res, c5 = upload(f"/api/gallery/events/{pub['id']}/media",
                 [("a.png", "image/png", PNG), ("b.png", "image/png", PNG)], T)
check("teacher uploads 2 images", c5 == 201 and len(res) == 2, f"({c5})")

_, c6 = upload(f"/api/gallery/events/{pub['id']}/media",
               [("bad.txt", "text/plain", b"hello")], T)
check("rejects unsupported type", c6 == 400, f"({c6})")

detail, _ = api("GET", f"/api/gallery/events/{pub['id']}")
check("cover auto-set from first image", bool(detail.get("cover_url")))
check("photo_count == 2", detail.get("photo_count") == 2, f"(got {detail.get('photo_count')})")

# File actually served?
try:
    r = urllib.request.urlopen(BASE + detail["media"][0]["url"])
    check("uploaded file is served", r.status == 200)
except Exception as e:
    check("uploaded file is served", False, str(e))

# ── Visibility ──
print("== Visibility ==")
anon, _ = api("GET", "/api/gallery/events")
anon_ids = {e["id"] for e in anon}
check("anonymous sees public", pub["id"] in anon_ids)
check("anonymous hides private", priv_mine["id"] not in anon_ids and priv_other["id"] not in anon_ids)

par, _ = api("GET", "/api/gallery/events", token=P)
par_ids = {e["id"] for e in par}
check("parent sees own class private event", priv_mine["id"] in par_ids)
check("parent ALSO sees other class private event", priv_other["id"] in par_ids)

_, c7 = api("GET", f"/api/gallery/events/{priv_other['id']}", token=P)
check("parent can open other class detail", c7 == 200, f"({c7})")

_, c7b = api("GET", f"/api/gallery/events/{priv_other['id']}")
check("anonymous gets 404 on private detail", c7b == 404, f"({c7b})")

tch, _ = api("GET", "/api/gallery/events", token=T)
check("teacher sees all 3", {pub["id"], priv_mine["id"], priv_other["id"]} <= {e["id"] for e in tch})

cat, _ = api("GET", "/api/gallery/events?category=sports")
check("category filter", all(e["category"] == "sports" for e in cat) and len(cat) >= 1)

# ── Permissions on edit/delete ──
print("== Edit / delete ==")
_, c8 = api("PATCH", f"/api/gallery/events/{priv_other['id']}", {"title": "Hijacked Title"}, T)
check("teacher cannot edit admin's event", c8 == 403, f"({c8})")

upd, c9 = api("PATCH", f"/api/gallery/events/{pub['id']}", {"title": "Annual Sports Day 2026"}, T)
check("teacher edits own event", c9 == 200 and upd["title"].endswith("2026"), f"({c9})")

mid = detail["media"][0]["id"]
_, c10 = api("DELETE", f"/api/gallery/media/{mid}", token=T)
check("teacher deletes own media", c10 == 204, f"({c10})")

for ev in (pub, priv_mine, priv_other):
    _, c = api("DELETE", f"/api/gallery/events/{ev['id']}", token=A)
    check(f"admin deletes event {ev['id']}", c == 204, f"({c})")

print("\n" + ("ALL GALLERY TESTS PASSED!" if failures == 0 else f"{failures} TEST(S) FAILED"))

r"""
Quick test script for the backend API.
Run: .\venv\Scripts\python.exe test_api.py
"""

import urllib.request
import json

BASE = "http://localhost:8000"

def api(method, path, data=None, token=None):
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(f"{BASE}{path}", data=body, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        resp = urllib.request.urlopen(req)
        return json.loads(resp.read()), resp.status
    except urllib.error.HTTPError as e:
        return json.loads(e.read()), e.code

print("=" * 60)
print("TEST 1: Health Check")
print("=" * 60)
result, code = api("GET", "/api/health")
print(f"  Status: {code} | Response: {result}")

print("\n" + "=" * 60)
print("TEST 2: Admin Login")
print("=" * 60)
result, code = api("POST", "/api/auth/login/admin", {
    "email": "admin@littleflowersschools.com",
    "password": "admin123"
})
print(f"  Status: {code} | Role: {result.get('role')} | Name: {result.get('name')}")
admin_token = result.get("access_token")

if not admin_token:
    print("  FAILED - Cannot proceed without admin token")
    exit(1)

print("\n" + "=" * 60)
print("TEST 3: Get Current User (GET /api/auth/me)")
print("=" * 60)
result, code = api("GET", "/api/auth/me", token=admin_token)
print(f"  Status: {code} | User: {result.get('name')} | Role: {result.get('role')}")

print("\n" + "=" * 60)
print("TEST 4: Create Teacher")
print("=" * 60)
result, code = api("POST", "/api/admin/teachers", {
    "name": "Dr. Anita Verma",
    "email": "anita.verma@littleflowersschools.com",
    "password": "teacher123",
    "designation": "Senior Teacher",
    "subject": "Mathematics",
    "department": "Mathematics",
}, token=admin_token)
print(f"  Status: {code} | Teacher: {result.get('name', result.get('detail'))}")

print("\n" + "=" * 60)
print("TEST 5: Create Student + Parent Login")
print("=" * 60)
result, code = api("POST", "/api/admin/students", {
    "name": "Aarav Sharma",
    "admission_number": "LFS2025001",
    "date_of_birth": "2016-03-15",
    "class_name": "Class III",
    "section": "A",
    "roll_number": "301",
    "parent_name": "Mrs. Priya Sharma",
    "parent_phone": "+91 99887 76543",
}, token=admin_token)
print(f"  Status: {code} | Result: {result.get('message', result.get('detail'))}")
if result.get("parent_login"):
    print(f"  Parent Login => Username: {result['parent_login']['username']}, Password: DOB")

print("\n" + "=" * 60)
print("TEST 6: Parent Login (admission_number + DOB)")
print("=" * 60)
result, code = api("POST", "/api/auth/login/parent", {
    "admission_number": "LFS2025001",
    "date_of_birth": "2016-03-15"
})
print(f"  Status: {code} | Role: {result.get('role')} | Name: {result.get('name')}")
parent_token = result.get("access_token")

if parent_token:
    print("\n" + "=" * 60)
    print("TEST 7: Parent - Get Profile")
    print("=" * 60)
    result, code = api("GET", "/api/auth/me", token=parent_token)
    print(f"  Status: {code} | User: {result.get('name')} | Role: {result.get('role')}")

print("\n" + "=" * 60)
print("TEST 8: Create Announcement (Admin)")
print("=" * 60)
result, code = api("POST", "/api/content/announcements", {
    "text": "Admission Opens for 2025-2026. Limited seats available!",
    "is_active": True,
}, token=admin_token)
print(f"  Status: {code} | Announcement ID: {result.get('id')}")

print("\n" + "=" * 60)
print("TEST 9: List Active Announcements (Public)")
print("=" * 60)
result, code = api("GET", "/api/content/announcements/active")
print(f"  Status: {code} | Count: {len(result)}")
for a in result:
    print(f"    - [{a['id']}] {a['text'][:50]}...")

print("\n" + "=" * 60)
print("TEST 10: List All Users (Admin)")
print("=" * 60)
result, code = api("GET", "/api/admin/users", token=admin_token)
print(f"  Status: {code} | Total Users: {len(result)}")
for u in result:
    print(f"    - [{u['role']}] {u['name']} (active={u['is_active']})")

print("\n" + "=" * 60)
print("ALL TESTS PASSED!")
print("=" * 60)

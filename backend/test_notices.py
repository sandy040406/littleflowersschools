"""
Automated test suite for Module M12: Notices, Circulars & School Calendar.
Tests public, parent, and admin endpoints using FastAPI TestClient.
"""

import sys
import os

# Ensure backend root is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from fastapi.testclient import TestClient
from app.main import app, lifespan
from app.core.database import SessionLocal, Base, engine
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.notice import Notice
from app.core.security import hash_password, create_access_token


def run_tests():
    print("=" * 60)
    print("RUNNING MODULE M12 (NOTICES & CALENDAR) TEST SUITE")
    print("=" * 60)

    # Trigger lifespan to create tables and seed admin + default content
    with TestClient(app) as client:
        db = SessionLocal()
        try:
            # 1. Health check
            res = client.get("/api/health")
            assert res.status_code == 200, f"Health check failed: {res.text}"
            print("PASS: Health check passed.")

            # 2. Public notices listing
            res = client.get("/api/notices")
            assert res.status_code == 200, f"Public notices failed: {res.text}"
            notices = res.json()
            assert len(notices) >= 3, f"Expected seeded notices, got {len(notices)}"
            # Ensure none of the public notices have a specific target_class
            for n in notices:
                assert not n.get("target_class"), f"Public notice should not have target_class: {n}"
            # Ensure pinned notice is first
            assert notices[0]["is_pinned"] is True, "First public notice should be pinned"
            print(f"PASS: Public notices listing verified ({len(notices)} whole-school circulars, pinned first).")

            # 3. Calendar endpoint
            res = client.get("/api/notices/calendar")
            assert res.status_code == 200, f"Calendar feed failed: {res.text}"
            cal_items = res.json()
            assert len(cal_items) > 0, "Calendar should contain items"
            assert any(item["item_type"] == "notice" for item in cal_items), "Calendar should contain notice items"
            print(f"PASS: Calendar timeline feed verified ({len(cal_items)} aggregated items).")

            # 4. Admin Auth & Notice Management
            admin_user = db.query(User).filter(User.role == UserRole.admin).first()
            assert admin_user is not None, "Admin user must exist"
            admin_token = create_access_token({"sub": str(admin_user.id), "role": admin_user.role.value, "type": "access"})
            admin_headers = {"Authorization": f"Bearer {admin_token}"}

            # Admin get all
            res = client.get("/api/notices/admin", headers=admin_headers)
            assert res.status_code == 200, f"Admin notices listing failed: {res.text}"
            all_admin_notices = res.json()
            # Admin can see the seeded Class I notice too
            assert any(n.get("target_class") == "Class I" for n in all_admin_notices), "Admin should see Class I notice"
            print(f"PASS: Admin listing verified ({len(all_admin_notices)} total notices including class-targeted).")

            # Admin create new notice for Class V
            new_notice_payload = {
                "title": "Class V Science Project Submission",
                "content": "All Class V students must submit their solar system models by Friday.",
                "category": "academic",
                "target_class": "Class V",
                "is_pinned": False,
                "is_active": True,
            }
            res = client.post("/api/notices/admin", json=new_notice_payload, headers=admin_headers)
            assert res.status_code == 201, f"Create notice failed: {res.text}"
            created_notice = res.json()
            notice_id = created_notice["id"]
            assert created_notice["target_class"] == "Class V"
            assert created_notice["title"] == new_notice_payload["title"]
            print(f"PASS: Admin notice creation verified (ID: {notice_id}, Target: Class V).")

            # Admin toggle pinned
            res = client.patch(f"/api/notices/admin/{notice_id}/toggle-pinned", headers=admin_headers)
            assert res.status_code == 200
            assert res.json()["is_pinned"] is True, "Pin toggle should set pinned=True"
            print("PASS: Admin toggle pinned verified.")

            # Admin update notice
            res = client.put(f"/api/notices/admin/{notice_id}", json={"title": "Class V Science Project (UPDATED)"}, headers=admin_headers)
            assert res.status_code == 200
            assert res.json()["title"] == "Class V Science Project (UPDATED)"
            print("PASS: Admin update notice verified.")

            # 5. Parent targeted access verification
            # Create a test parent with child in Class V
            parent_email = "test_parent_v@littleflowers.test"
            parent_user = db.query(User).filter(User.email == parent_email).first()
            if not parent_user:
                parent_user = User(
                    name="Parent of Class V",
                    email=parent_email,
                    role=UserRole.parent,
                    hashed_password=hash_password("ParentPass123!"),
                    is_active=True,
                )
                db.add(parent_user)
                db.commit()
                db.refresh(parent_user)

            # Link student in Class V
            student = db.query(Student).filter(Student.admission_number == "ADM-V-999").first()
            if not student:
                student = Student(
                    name="Kid in Class V",
                    admission_number="ADM-V-999",
                    date_of_birth="2016-04-10",
                    class_name="Class V",
                    section="A",
                    parent_id=parent_user.id,
                    is_active=True,
                )
                db.add(student)
                db.commit()

            parent_token = create_access_token({"sub": str(parent_user.id), "role": parent_user.role.value, "type": "access"})
            parent_headers = {"Authorization": f"Bearer {parent_token}"}

            res = client.get("/api/notices/parent", headers=parent_headers)
            assert res.status_code == 200, f"Parent notices failed: {res.text}"
            p_notices = res.json()
            titles = [n["title"] for n in p_notices]
            
            # This parent should see:
            # 1) Whole school notices
            # 2) Class V notice
            assert "Class V Science Project (UPDATED)" in titles, "Parent of Class V must see Class V notice"
            # 3) But should NOT see Class I notice
            assert "Class I Parent-Teacher Meeting (PTM)" not in titles, "Parent of Class V must NOT see Class I notice"
            print("PASS: Parent targeted notices verified (sees whole school + Class V, cannot see Class I).")

            # 6. Admin delete
            res = client.delete(f"/api/notices/admin/{notice_id}", headers=admin_headers)
            assert res.status_code == 200, f"Delete notice failed: {res.text}"
            # Verify deleted from admin list
            res = client.get("/api/notices/admin", headers=admin_headers)
            assert not any(n["id"] == notice_id for n in res.json()), "Deleted notice must not appear in admin list"
            print("PASS: Admin delete notice verified.")

        finally:
            db.close()

    print("=" * 60)
    print("ALL M12 BACKEND TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    run_tests()

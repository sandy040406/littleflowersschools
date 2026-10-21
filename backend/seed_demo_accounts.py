"""
Seed script to create predictable demo accounts and test data for manual verification.
Usage: python backend/seed_demo_accounts.py
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.core.database import SessionLocal, Base, engine
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.gallery import Event, Media, MediaType, Visibility
from app.models.notice import Notice
from app.models.content import SiteSetting, Announcement, HeroSlide


def seed():
    print("[*] Seeding demo accounts and test data...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Admin
        admin = db.query(User).filter(User.role == UserRole.admin).first()
        if not admin:
            admin = User(
                name="Super Admin",
                email="admin@littleflowersschools.com",
                role=UserRole.admin,
                hashed_password=hash_password("admin123"),
                is_active=True,
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
        else:
            admin.hashed_password = hash_password("admin123")
            admin.is_active = True
            db.commit()
        print("  -> Admin: admin@littleflowersschools.com / admin123")

        # 2. Teacher
        teacher = db.query(User).filter(User.email == "teacher@littleflowersschools.com").first()
        if not teacher:
            teacher = User(
                name="Mrs. Ananya Sharma",
                email="teacher@littleflowersschools.com",
                role=UserRole.teacher,
                hashed_password=hash_password("teacher123"),
                designation="Senior Science Faculty",
                department="Science",
                subject="Physics & Chemistry",
                experience="8 years",
                bio="Passionate educator dedicated to inspiring young minds through hands-on experimental learning.",
                photo_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
                is_active=True,
            )
            db.add(teacher)
            db.commit()
            db.refresh(teacher)
        else:
            teacher.hashed_password = hash_password("teacher123")
            teacher.is_active = True
            teacher.designation = "Senior Science Faculty"
            teacher.department = "Science"
            teacher.subject = "Physics & Chemistry"
            teacher.experience = "8 years"
            db.commit()
        print("  -> Teacher: teacher@littleflowersschools.com / teacher123")

        # 3. Parent (Rajesh Kumar with 2 children: Aarav in Class I and Ananya in Class V)
        parent = db.query(User).filter(User.email == "parent@littleflowersschools.com").first()
        if not parent:
            parent = User(
                name="Rajesh Kumar",
                email="parent@littleflowersschools.com",
                phone="+91 98765 43210",
                role=UserRole.parent,
                hashed_password=hash_password("ParentPass123!"),
                admission_number="ADM-2024-001",
                date_of_birth="2018-05-15",
                is_active=True,
            )
            db.add(parent)
            db.commit()
            db.refresh(parent)
        else:
            parent.hashed_password = hash_password("ParentPass123!")
            parent.admission_number = "ADM-2024-001"
            parent.date_of_birth = "2018-05-15"
            parent.is_active = True
            db.commit()

        # Children
        child1 = db.query(Student).filter(Student.admission_number == "ADM-2024-001").first()
        if not child1:
            child1 = Student(
                name="Aarav Kumar",
                admission_number="ADM-2024-001",
                date_of_birth="2018-05-15",
                class_name="Class I",
                section="A",
                roll_number="101",
                admission_date="2024-04-01",
                parent_id=parent.id,
                is_active=True,
            )
            db.add(child1)
        else:
            child1.parent_id = parent.id
            child1.class_name = "Class I"
            child1.section = "A"
            child1.is_active = True

        child2 = db.query(Student).filter(Student.admission_number == "ADM-2024-002").first()
        if not child2:
            child2 = Student(
                name="Ananya Kumar",
                admission_number="ADM-2024-002",
                date_of_birth="2014-08-20",
                class_name="Class V",
                section="B",
                roll_number="505",
                admission_date="2021-04-01",
                parent_id=parent.id,
                is_active=True,
            )
            db.add(child2)
        else:
            child2.parent_id = parent.id
            child2.class_name = "Class V"
            child2.section = "B"
            child2.is_active = True

        db.commit()
        print("  -> Parent: Admission No: ADM-2024-001 (or ADM-2024-002) / Password: ParentPass123!")
        print("             Children: Aarav Kumar (Class I - A) and Ananya Kumar (Class V - B)")

        # 4. Sample Gallery Events
        ev1 = db.query(Event).filter(Event.title == "Annual Sports Day 2026").first()
        if not ev1:
            ev1 = Event(
                title="Annual Sports Day 2026",
                description="Highlights of athletic competitions, track races, and drill displays.",
                event_date="2026-03-15",
                category="sports",
                visibility=Visibility.public,
                cover_url="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=500&fit=crop",
                created_by=teacher.id,
            )
            db.add(ev1)
            db.commit()
            db.refresh(ev1)
            # Add photos to event
            db.add(Media(
                event_id=ev1.id,
                media_type=MediaType.image,
                file_name="sports_day_1.jpg",
                storage_key="seed/sports_day_1.jpg",
                url="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=500&fit=crop",
                visibility=Visibility.public,
                uploaded_by=teacher.id
            ))
            db.commit()

        ev2 = db.query(Event).filter(Event.title == "Class I Science Showcase").first()
        if not ev2:
            ev2 = Event(
                title="Class I Science Showcase",
                description="Our primary learners demonstrating simple physical models and plant life cycles.",
                event_date="2026-04-10",
                category="activities",
                class_name="Class I",
                visibility=Visibility.private,
                cover_url="https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=500&fit=crop",
                created_by=teacher.id,
            )
            db.add(ev2)
            db.commit()
            db.refresh(ev2)
            db.add(Media(
                event_id=ev2.id,
                media_type=MediaType.image,
                file_name="science_showcase_1.jpg",
                storage_key="seed/science_showcase_1.jpg",
                url="https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=500&fit=crop",
                visibility=Visibility.private,
                uploaded_by=teacher.id
            ))
            db.commit()
        print("  -> Gallery: 1 Public Event (Annual Sports Day) + 1 Parents-Only Event (Class I Showcase)")

        # 5. Targeted Notices
        def ensure_notice(title, content, cat, target, pinned):
            existing = db.query(Notice).filter(Notice.title == title).first()
            if not existing:
                db.add(Notice(
                    title=title, content=content, category=cat, target_class=target,
                    is_pinned=pinned, is_active=True, created_by=admin.id
                ))

        ensure_notice("Annual Sports Day 2026 — Schedule & Guidelines", "All students must assemble in sports uniform by 8:30 AM.", "circular", None, True)
        ensure_notice("Mid-Term Examination Schedule Announced", "Revision worksheets have been handed over to subject teachers.", "exam", None, True)
        ensure_notice("Class I Parent-Teacher Meeting (PTM)", "Conference slots with Class I teachers this Saturday.", "academic", "Class I", False)
        ensure_notice("Class V Science Exhibition Project", "Class V students must submit model outlines by next Monday.", "academic", "Class V", False)
        ensure_notice("Class X Board Examination Preparation", "Special preparatory classes for Class X students.", "academic", "Class X", False)
        ensure_notice("Winter Vacation & School Reopening Schedule", "Winter break starts from Dec 24.", "holiday", None, False)
        db.commit()
        print("  -> Notices: Seeded Whole-School, Class I, Class V, and Class X notices")

        print("[OK] Demo seed completed successfully!")
    finally:
        db.close()


if __name__ == "__main__":
    seed()

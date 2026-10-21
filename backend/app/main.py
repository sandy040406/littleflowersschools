"""
Little Flowers Schools — FastAPI Backend
Main application entry point.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import get_settings
from app.core.database import engine, Base, SessionLocal
from app.core.migrate import sync_missing_columns
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.content import Announcement, HeroSlide
from app.models.gallery import Event, Media  # noqa: F401 (registers tables)
from app.models.enquiry import Enquiry  # noqa: F401 (registers table)

# Import all route modules
from app.routes import auth, admin, content, upload, gallery, enquiry

settings = get_settings()


def seed_admin(db):
    """Create the default admin account if it doesn't exist."""
    existing = db.query(User).filter(User.role == UserRole.admin).first()
    if not existing:
        admin_user = User(
            role=UserRole.admin,
            name="Super Admin",
            email=settings.ADMIN_EMAIL,
            hashed_password=hash_password(settings.ADMIN_PASSWORD),
            is_active=True,
        )
        db.add(admin_user)
        db.commit()
        print(f"[OK] Admin account created: {settings.ADMIN_EMAIL}")
    else:
        print(f"[OK] Admin account already exists: {existing.email}")


DEFAULT_SLIDES = [
    ("ANNUAL DAY CELEBRATION", "Unearthing Talent",
     "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&h=900&fit=crop"),
    ("SPORTS EXTRAVAGANZA", "Building Character Through Play",
     "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1600&h=900&fit=crop"),
    ("SCIENCE EXHIBITION", "Fostering Innovation",
     "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1600&h=900&fit=crop"),
]

DEFAULT_ANNOUNCEMENTS = [
    ("Admissions open for the new academic year. Limited seats available!", "important", "/enquiry"),
    ("Annual Sports Meet scheduled for next month.", "info", None),
]


def seed_content(db):
    """Seed starter homepage content the first time only (admin can edit/delete)."""
    if db.query(HeroSlide).count() == 0:
        for order, (title, subtitle, url) in enumerate(DEFAULT_SLIDES, start=1):
            db.add(HeroSlide(
                title=title, subtitle=subtitle, image_url=url, display_order=order,
                cta_label="Explore Our School", cta_link="/about",
            ))
        print("[OK] Seeded default hero slides.")
    if db.query(Announcement).count() == 0:
        for text, priority, link in DEFAULT_ANNOUNCEMENTS:
            db.add(Announcement(text=text, priority=priority, link=link))
        print("[OK] Seeded default announcements.")
    db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create tables + seed admin. Shutdown: cleanup."""
    # Create all tables
    Base.metadata.create_all(bind=engine)
    added = sync_missing_columns(engine)
    if added:
        print(f"[OK] Added new columns: {', '.join(added)}")
    print("[OK] Database tables created/verified.")

    # Seed admin + starter content
    db = SessionLocal()
    try:
        seed_admin(db)
        seed_content(db)
    finally:
        db.close()

    # Ensure upload directory exists
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "images"), exist_ok=True)

    yield  # App is running

    print("[BYE] Shutting down...")


# ── Create App ──────────────────────────────────────────────

app = FastAPI(
    title="Little Flowers Schools API",
    description="Backend API for Little Flowers Schools website and portal.",
    version="0.1.0",
    lifespan=lifespan,
)

# ── CORS Middleware ─────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static Files (uploaded images) ──────────────────────────

if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# ── Register Routes ─────────────────────────────────────────

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(content.router)
app.include_router(upload.router)
app.include_router(gallery.router)
app.include_router(enquiry.router)
app.include_router(enquiry.contact_router)


# ── Health Check ────────────────────────────────────────────

@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "Little Flowers Schools API is running"}

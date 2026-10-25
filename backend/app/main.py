"""
Little Flowers Schools — FastAPI Backend
Main application entry point.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
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
from app.models.notice import Notice  # noqa: F401 (registers table)

# Import all route modules
from app.routes import auth, admin, content, upload, gallery, enquiry, notice

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


DEFAULT_NOTICES = [
    (
        "Annual Sports Day 2026 — Schedule & Guidelines",
        "We are thrilled to announce the upcoming Annual Sports Meet scheduled for next month. All students must assemble in proper sports uniform by 8:30 AM. Parents are cordially invited to cheer the participants.",
        "circular",
        None,
        True,
    ),
    (
        "Mid-Term Examination Schedule Announced",
        "The datesheet and syllabus breakdown for mid-term assessments have been published. Revision worksheets will be distributed by class teachers this week.",
        "exam",
        None,
        True,
    ),
    (
        "Class I Parent-Teacher Meeting (PTM)",
        "Individual 10-minute conference slots with Class I subject teachers will be conducted this Saturday from 9:00 AM to 1:00 PM. Kindly confirm attendance.",
        "academic",
        "Class I",
        False,
    ),
    (
        "Winter Vacation & School Reopening Schedule",
        "School will remain closed for winter break from December 24 to January 4. Regular classes will resume on Monday, January 5.",
        "holiday",
        None,
        False,
    ),
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
    if db.query(Notice).count() == 0:
        for title, content, category, target_class, is_pinned in DEFAULT_NOTICES:
            db.add(Notice(
                title=title,
                content=content,
                category=category,
                target_class=target_class,
                is_pinned=is_pinned,
                is_active=True,
            ))
        print("[OK] Seeded default notices & circulars.")
    db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create tables + seed admin. Shutdown: cleanup."""
    # Refuse to start in production with default secrets/passwords
    settings.validate_for_production()

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
    # Hide interactive API docs on the live site
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc",
    openapi_url=None if settings.is_production else "/openapi.json",
)

# ── Security headers ────────────────────────────────────────


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
    if settings.is_production:
        response.headers.setdefault("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
    return response


# ── CORS Middleware ─────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
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
app.include_router(notice.router)


# ── Health Check ────────────────────────────────────────────

@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "Little Flowers Schools API is running"}

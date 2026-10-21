"""
Content management routes.

  Public:
  GET    /api/content/announcements/active  → Currently visible announcements
  GET    /api/content/slides/active         → Active hero slides (ordered)

  Admin only:
  GET    /api/content/announcements        → List all announcements
  POST   /api/content/announcements        → Create announcement
  PUT    /api/content/announcements/{id}   → Update announcement
  DELETE /api/content/announcements/{id}   → Delete announcement

  GET    /api/content/slides               → List all hero slides
  POST   /api/content/slides               → Create hero slide
  PUT    /api/content/slides/reorder       → Reorder slides
  PUT    /api/content/slides/{id}          → Update hero slide
  DELETE /api/content/slides/{id}          → Delete hero slide
"""

from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_role
from app.models.user import User, UserRole
from app.models.content import Announcement, HeroSlide, SiteSetting
from app.schemas.auth import PublicFacultyOut
from app.schemas.content import (
    AnnouncementCreate, AnnouncementUpdate, AnnouncementOut,
    HeroSlideCreate, HeroSlideUpdate, HeroSlideOut, ReorderRequest,
    SiteSettingsOut, SiteSettingsUpdate,
)

router = APIRouter(prefix="/api/content", tags=["Content Management"])

admin_only = require_role([UserRole.admin])

PRIORITY_RANK = {"urgent": 0, "important": 1, "info": 2}


def _check_dates(start, end):
    if start and end and end < start:
        raise HTTPException(status_code=400, detail="End date cannot be before start date")


# ── Announcements ───────────────────────────────────────────

@router.get("/announcements", response_model=list[AnnouncementOut])
def list_announcements(
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """List all announcements (Admin only)."""
    return db.query(Announcement).order_by(Announcement.created_at.desc()).all()


@router.get("/announcements/active", response_model=list[AnnouncementOut])
def list_active_announcements(db: Session = Depends(get_db)):
    """Announcements that are active and within their date window (public)."""
    today = date.today()
    items = (
        db.query(Announcement)
        .filter(Announcement.is_active == True)  # noqa: E712
        .filter(or_(Announcement.start_date == None, Announcement.start_date <= today))  # noqa: E711
        .filter(or_(Announcement.end_date == None, Announcement.end_date >= today))  # noqa: E711
        .order_by(Announcement.created_at.desc())
        .all()
    )
    # Urgent first, then important, then info (stable → newest first within group)
    return sorted(items, key=lambda a: PRIORITY_RANK.get(a.priority or "info", 2))


@router.post("/announcements", response_model=AnnouncementOut, status_code=201)
def create_announcement(
    body: AnnouncementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """Create a new announcement (Admin only)."""
    _check_dates(body.start_date, body.end_date)
    announcement = Announcement(**body.model_dump())
    db.add(announcement)
    db.commit()
    db.refresh(announcement)
    return announcement


@router.put("/announcements/{announcement_id}", response_model=AnnouncementOut)
def update_announcement(
    announcement_id: int,
    body: AnnouncementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """Update an announcement (Admin only). Send null to clear link/dates."""
    announcement = db.get(Announcement, announcement_id)
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        if field in ("text", "priority", "is_active") and value is None:
            continue  # these can't be cleared
        setattr(announcement, field, value)

    _check_dates(announcement.start_date, announcement.end_date)
    db.commit()
    db.refresh(announcement)
    return announcement


@router.delete("/announcements/{announcement_id}")
def delete_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """Delete an announcement (Admin only)."""
    announcement = db.get(Announcement, announcement_id)
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")

    db.delete(announcement)
    db.commit()
    return {"message": "Announcement deleted."}


# ── Hero Slides ─────────────────────────────────────────────

@router.get("/slides", response_model=list[HeroSlideOut])
def list_slides(
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """List all hero slides (Admin only)."""
    return db.query(HeroSlide).order_by(HeroSlide.display_order, HeroSlide.id).all()


@router.get("/slides/active", response_model=list[HeroSlideOut])
def list_active_slides(db: Session = Depends(get_db)):
    """List only active slides (for the public homepage slider)."""
    return (
        db.query(HeroSlide)
        .filter(HeroSlide.is_active == True)  # noqa: E712
        .order_by(HeroSlide.display_order, HeroSlide.id)
        .all()
    )


@router.post("/slides", response_model=HeroSlideOut, status_code=201)
def create_slide(
    body: HeroSlideCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """Create a new hero slide (Admin only). Appended to the end by default."""
    data = body.model_dump()
    if data["display_order"] is None:
        max_order = db.query(func.max(HeroSlide.display_order)).scalar()
        data["display_order"] = (max_order or 0) + 1
    slide = HeroSlide(**data)
    db.add(slide)
    db.commit()
    db.refresh(slide)
    return slide


# NOTE: must be declared before /slides/{slide_id}
@router.put("/slides/reorder", response_model=list[HeroSlideOut])
def reorder_slides(
    body: ReorderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """Set display order from an ordered list of slide IDs (Admin only)."""
    slides = {s.id: s for s in db.query(HeroSlide).filter(HeroSlide.id.in_(body.ids)).all()}
    if len(slides) != len(set(body.ids)):
        raise HTTPException(status_code=400, detail="One or more slides not found")
    for position, slide_id in enumerate(body.ids, start=1):
        slides[slide_id].display_order = position
    db.commit()
    return db.query(HeroSlide).order_by(HeroSlide.display_order, HeroSlide.id).all()


@router.put("/slides/{slide_id}", response_model=HeroSlideOut)
def update_slide(
    slide_id: int,
    body: HeroSlideUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """Update a hero slide (Admin only)."""
    slide = db.get(HeroSlide, slide_id)
    if not slide:
        raise HTTPException(status_code=404, detail="Slide not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        if field in ("title", "image_url", "is_active", "display_order") and value is None:
            continue  # required fields can't be cleared
        setattr(slide, field, value)

    db.commit()
    db.refresh(slide)
    return slide


@router.delete("/slides/{slide_id}")
def delete_slide(
    slide_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """Delete a hero slide (Admin only)."""
    slide = db.get(HeroSlide, slide_id)
    if not slide:
        raise HTTPException(status_code=404, detail="Slide not found")

    db.delete(slide)
    db.commit()
    return {"message": "Slide deleted."}


# ── Public Faculty ──────────────────────────────────────────

@router.get("/faculty", response_model=list[PublicFacultyOut])
def get_public_faculty(db: Session = Depends(get_db)):
    """Public endpoint to list active teachers for the website faculty page."""
    teachers = db.query(User).filter(
        User.role == UserRole.teacher,
        User.is_active == True,
    ).order_by(User.id.asc()).all()
    return teachers


# ── Site Settings ───────────────────────────────────────────

def get_or_create_settings(db: Session) -> SiteSetting:
    setting = db.query(SiteSetting).first()
    if not setting:
        setting = SiteSetting(
            school_name="Little Flowers Schools",
            tagline="Growing Curious Minds. Building Confident Futures.",
            phone="+91 11 2345 6789",
            email="info@littleflowersschools.com",
            address="123 Education Lane, New Delhi, India 110001",
            office_hours="Mon – Sat: 9:00 AM – 4:00 PM",
            school_timings="Mon – Fri: 8:00 AM – 2:30 PM",
            about_text="At Little Flowers Schools, we believe that education is about nurturing the whole child — mind, body, and spirit. For over two decades, we have been providing high-quality education in a safe, caring, and stimulating environment.",
            vision_text="To be a center of educational excellence that empowers students to reach their full potential and become thoughtful, productive global citizens.",
            mission_text="To provide an inclusive, inspiring learning environment that fosters academic excellence, character development, and lifelong curiosity.",
        )
        db.add(setting)
        db.commit()
        db.refresh(setting)
    return setting


@router.get("/settings", response_model=SiteSettingsOut)
def get_site_settings(db: Session = Depends(get_db)):
    """Public endpoint to fetch current school info and editable site copy."""
    return get_or_create_settings(db)


@router.put("/settings", response_model=SiteSettingsOut)
def update_site_settings(
    body: SiteSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """Admin endpoint to update school settings and site copy."""
    setting = get_or_create_settings(db)
    for field, val in body.model_dump(exclude_unset=True).items():
        if val is not None:
            setattr(setting, field, val.strip() if isinstance(val, str) else val)
    db.commit()
    db.refresh(setting)
    return setting


"""
Content models — Announcements (alert ticker) and Hero Slides.
These are managed by the Admin via the admin portal.
"""

from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Text

from app.core.database import Base


class Announcement(Base):
    """Alert messages displayed on the homepage ticker."""
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    link = Column(String(500), nullable=True)            # optional "read more" URL
    priority = Column(String(20), default="info", nullable=False)  # info | important | urgent
    start_date = Column(Date, nullable=True)             # show from (inclusive)
    end_date = Column(Date, nullable=True)               # show until (inclusive)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class HeroSlide(Base):
    """Hero slider images on the homepage."""
    __tablename__ = "hero_slides"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    subtitle = Column(String(200), nullable=True)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=False)
    cta_label = Column(String(60), nullable=True)        # e.g. "Explore Our School"
    cta_link = Column(String(500), nullable=True)        # e.g. "/about"
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

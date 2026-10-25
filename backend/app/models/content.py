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


class SiteSetting(Base):
    """
    Key-value or unified record storing school-wide editable settings.
    Allows non-technical admins to update contact details, address, hours,
    and about text from the portal.
    """
    __tablename__ = "site_settings"

    id = Column(Integer, primary_key=True)
    school_name = Column(String(200), default="Little Flowers Schools", nullable=False)
    tagline = Column(String(300), default="Growing Curious Minds. Building Confident Futures.", nullable=True)
    phone = Column(String(50), default="+91 11 2345 6789", nullable=True)
    email = Column(String(100), default="info@littleflowersschools.com", nullable=True)
    address = Column(Text, default="123 Education Lane, New Delhi, India 110001", nullable=True)
    office_hours = Column(String(150), default="Mon – Sat: 9:00 AM – 4:00 PM", nullable=True)
    school_timings = Column(String(150), default="Mon – Fri: 8:00 AM – 2:30 PM", nullable=True)
    map_url = Column(Text, nullable=True)
    facebook_url = Column(String(300), nullable=True)
    instagram_url = Column(String(300), nullable=True)
    youtube_url = Column(String(300), nullable=True)
    twitter_url = Column(String(300), nullable=True)
    about_text = Column(Text, nullable=True)
    about_image_url = Column(String(500), nullable=True)
    vision_text = Column(Text, nullable=True)
    mission_text = Column(Text, nullable=True)

    # Principal Desk CMS
    principal_name = Column(String(200), default="Dr. Meena Sharma", nullable=True)
    principal_title = Column(String(200), default="Principal", nullable=True)
    principal_image_url = Column(String(500), default="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop", nullable=True)
    principal_message = Column(Text, nullable=True)

    # Rich Sections JSON storage
    facilities_json = Column(Text, nullable=True)          # List of { id, title, description, image_url }
    activities_json = Column(Text, nullable=True)          # List of { id, title, description, image_url, icon, bullets }
    educational_journey_json = Column(Text, nullable=True) # List of { id, name, grades, focus, highlights, color }
    academics_methodology_json = Column(Text, nullable=True) # { methodology_text, assessment_text, support_text }

    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


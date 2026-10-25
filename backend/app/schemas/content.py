"""
Pydantic schemas for content management (announcements & slider).
"""

from datetime import datetime, date
from typing import Optional, Literal

from pydantic import BaseModel, Field

Priority = Literal["info", "important", "urgent"]


# ── Announcement ────────────────────────────────────────────

class AnnouncementCreate(BaseModel):
    text: str = Field(min_length=1, max_length=500)
    link: Optional[str] = None
    priority: Priority = "info"
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: bool = True


class AnnouncementUpdate(BaseModel):
    text: Optional[str] = Field(default=None, min_length=1, max_length=500)
    link: Optional[str] = None
    priority: Optional[Priority] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: Optional[bool] = None


class AnnouncementOut(BaseModel):
    id: int
    text: str
    link: Optional[str] = None
    priority: str = "info"
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Hero Slide ──────────────────────────────────────────────

class HeroSlideCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    subtitle: Optional[str] = None
    description: Optional[str] = None
    image_url: str
    cta_label: Optional[str] = None
    cta_link: Optional[str] = None
    display_order: Optional[int] = None   # None → append to end
    is_active: bool = True


class HeroSlideUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    subtitle: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    cta_label: Optional[str] = None
    cta_link: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


class HeroSlideOut(BaseModel):
    id: int
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    image_url: str
    cta_label: Optional[str] = None
    cta_link: Optional[str] = None
    display_order: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ReorderRequest(BaseModel):
    ids: list[int]   # slide IDs in the desired display order


# ── Site Settings ───────────────────────────────────────────

class SiteSettingsOut(BaseModel):
    id: int
    school_name: str
    tagline: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    office_hours: Optional[str] = None
    school_timings: Optional[str] = None
    map_url: Optional[str] = None
    facebook_url: Optional[str] = None
    instagram_url: Optional[str] = None
    youtube_url: Optional[str] = None
    twitter_url: Optional[str] = None
    about_text: Optional[str] = None
    about_image_url: Optional[str] = None
    vision_text: Optional[str] = None
    mission_text: Optional[str] = None
    principal_name: Optional[str] = None
    principal_title: Optional[str] = None
    principal_image_url: Optional[str] = None
    principal_message: Optional[str] = None
    facilities_json: Optional[str] = None
    activities_json: Optional[str] = None
    educational_journey_json: Optional[str] = None
    academics_methodology_json: Optional[str] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class SiteSettingsUpdate(BaseModel):
    school_name: Optional[str] = None
    tagline: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    office_hours: Optional[str] = None
    school_timings: Optional[str] = None
    map_url: Optional[str] = None
    facebook_url: Optional[str] = None
    instagram_url: Optional[str] = None
    youtube_url: Optional[str] = None
    twitter_url: Optional[str] = None
    about_text: Optional[str] = None
    about_image_url: Optional[str] = None
    vision_text: Optional[str] = None
    mission_text: Optional[str] = None
    principal_name: Optional[str] = None
    principal_title: Optional[str] = None
    principal_image_url: Optional[str] = None
    principal_message: Optional[str] = None
    facilities_json: Optional[str] = None
    activities_json: Optional[str] = None
    educational_journey_json: Optional[str] = None
    academics_methodology_json: Optional[str] = None



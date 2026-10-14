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

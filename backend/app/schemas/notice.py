"""
Pydantic schemas for School Notices, Circulars, and Calendar items.
"""

from datetime import datetime, date
from typing import Optional, Literal
from pydantic import BaseModel, Field

NoticeCategory = Literal["circular", "academic", "holiday", "exam", "fee", "general"]


class NoticeCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    content: str = Field(min_length=1)
    category: NoticeCategory = "general"
    target_class: Optional[str] = None
    attachment_url: Optional[str] = None
    publish_date: Optional[str] = None  # YYYY-MM-DD
    is_pinned: bool = False
    is_active: bool = True


class NoticeUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    content: Optional[str] = Field(default=None, min_length=1)
    category: Optional[NoticeCategory] = None
    target_class: Optional[str] = None
    attachment_url: Optional[str] = None
    publish_date: Optional[str] = None
    is_pinned: Optional[bool] = None
    is_active: Optional[bool] = None


class NoticeOut(BaseModel):
    id: int
    title: str
    content: str
    category: str
    target_class: Optional[str] = None
    attachment_url: Optional[str] = None
    publish_date: str
    is_pinned: bool
    is_active: bool
    created_by: Optional[int] = None
    author_name: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class CalendarItemOut(BaseModel):
    id: str
    item_type: Literal["event", "notice"]
    title: str
    description: Optional[str] = None
    date: str
    category: str
    target_class: Optional[str] = None
    cover_url: Optional[str] = None

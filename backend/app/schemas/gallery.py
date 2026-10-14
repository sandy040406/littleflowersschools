"""
Pydantic schemas for gallery events & media.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.gallery import Visibility, MediaType


class EventCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    description: Optional[str] = None
    event_date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    category: str = "events"
    class_name: Optional[str] = None
    section: Optional[str] = None
    visibility: Visibility = Visibility.public


class EventUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=2, max_length=200)
    description: Optional[str] = None
    event_date: Optional[str] = Field(default=None, pattern=r"^\d{4}-\d{2}-\d{2}$")
    category: Optional[str] = None
    class_name: Optional[str] = None
    section: Optional[str] = None
    visibility: Optional[Visibility] = None
    cover_url: Optional[str] = None


class EventOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    event_date: str
    category: str
    class_name: Optional[str]
    section: Optional[str]
    visibility: Visibility
    cover_url: Optional[str]
    photo_count: int = 0
    video_count: int = 0
    created_by: Optional[int]
    created_at: datetime


class MediaOut(BaseModel):
    id: int
    event_id: int
    uploaded_by: Optional[int]
    file_name: str
    url: str
    media_type: MediaType
    file_size: int
    title: Optional[str]
    visibility: Visibility
    created_at: datetime

    model_config = {"from_attributes": True}


class EventDetailOut(EventOut):
    media: list[MediaOut] = []

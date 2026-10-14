"""
Gallery models — Events and their Media (photos / videos).

Visibility rules:
  - public  → anyone (website gallery) can see it
  - private → only logged-in parents of that class, teachers and admin
An event with no class_name is a whole-school event.
"""

import enum
from datetime import datetime, timezone

from sqlalchemy import (
    Column, Integer, String, Text, DateTime, Enum, ForeignKey, BigInteger
)
from sqlalchemy.orm import relationship

from app.core.database import Base


def _now():
    return datetime.now(timezone.utc)


class Visibility(str, enum.Enum):
    public = "public"
    private = "private"


class MediaType(str, enum.Enum):
    image = "image"
    video = "video"


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    event_date = Column(String(10), nullable=False)          # YYYY-MM-DD
    category = Column(String(50), default="events", nullable=False)
    class_name = Column(String(50), nullable=True, index=True)  # None = whole school
    section = Column(String(10), nullable=True)
    visibility = Column(Enum(Visibility), default=Visibility.public, nullable=False)
    cover_url = Column(String(500), nullable=True)

    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=_now)
    updated_at = Column(DateTime, default=_now, onupdate=_now)

    media = relationship(
        "Media", back_populates="event",
        cascade="all, delete-orphan", order_by="Media.id.desc()",
    )


class Media(Base):
    __tablename__ = "media"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    uploaded_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    file_name = Column(String(255), nullable=False)
    storage_key = Column(String(500), nullable=False)
    url = Column(String(500), nullable=False)
    media_type = Column(Enum(MediaType), nullable=False)
    content_type = Column(String(100), nullable=True)
    file_size = Column(BigInteger, default=0)
    title = Column(String(200), nullable=True)
    visibility = Column(Enum(Visibility), default=Visibility.public, nullable=False)

    created_at = Column(DateTime, default=_now)

    event = relationship("Event", back_populates="media")

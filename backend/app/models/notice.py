"""
Notice / Circular model - official school announcements, circulars, and class-specific notices.
"""

from datetime import datetime, timezone, date
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


def _now():
    return datetime.now(timezone.utc)


def _today_str():
    return date.today().isoformat()


class Notice(Base):
    __tablename__ = "notices"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(50), default="general", nullable=False)  # circular, academic, holiday, exam, fee, general
    
    # None / empty = Whole School (all students & public).
    # Specific class (e.g. "Class I", "Class X") = Targeted to that grade.
    target_class = Column(String(50), nullable=True, index=True)
    
    attachment_url = Column(String(500), nullable=True)  # link to image or document
    publish_date = Column(String(10), default=_today_str, nullable=False)  # YYYY-MM-DD
    is_pinned = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=_now)
    updated_at = Column(DateTime, default=_now, onupdate=_now)

    author = relationship("User", foreign_keys=[created_by], lazy="joined")

    def __repr__(self) -> str:
        return f"<Notice id={self.id} title={self.title} class={self.target_class}>"

"""
Student model — linked to a parent user.
The admission_number here is also the parent's login username.
"""

from datetime import datetime, timezone

from sqlalchemy import (
    Column, Integer, String, ForeignKey, DateTime, Boolean
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    admission_number = Column(String(50), unique=True, nullable=False, index=True)
    date_of_birth = Column(String(10), nullable=False)  # YYYY-MM-DD
    class_name = Column(String(50), nullable=False)       # e.g. "Class III"
    section = Column(String(10), default="A")
    roll_number = Column(String(20), nullable=True)
    admission_date = Column(String(10), nullable=True)     # YYYY-MM-DD
    is_active = Column(Boolean, default=True, nullable=False)

    # FK → parent user
    parent_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self) -> str:
        return f"<Student id={self.id} name={self.name} adm={self.admission_number}>"

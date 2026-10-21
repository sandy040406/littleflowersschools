"""
User model — covers Admin, Teacher, and Parent roles.

Auth rules:
  - Admin:   email + password login. Created via seed.
  - Teacher: email + password login. Created by Admin.
  - Parent:  admission_number (username) + date_of_birth (password).
             Created by Admin when adding a student.
"""

import enum
from datetime import datetime, timezone

from sqlalchemy import (
    Column, Integer, String, Enum, Boolean, DateTime, Text
)

from app.core.database import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    teacher = "teacher"
    parent = "parent"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    role = Column(Enum(UserRole), nullable=False, index=True)

    # Shared fields
    name = Column(String(200), nullable=False)
    email = Column(String(255), unique=True, nullable=True, index=True)
    phone = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    # Auth — for Admin & Teacher (hashed password)
    hashed_password = Column(String(255), nullable=True)

    # When True the user must set a new password before using the portal
    # (set by an admin password reset). Parents without a password yet are
    # also forced to set one — see `needs_password_change`.
    must_change_password = Column(Boolean, default=False, nullable=False)

    # Auth — for Parent (admission_number login)
    # Parents don't use email/password; they use admission_number + DOB
    admission_number = Column(String(50), unique=True, nullable=True, index=True)
    date_of_birth = Column(String(10), nullable=True)  # stored as YYYY-MM-DD string

    # Teacher-specific
    designation = Column(String(100), nullable=True)
    subject = Column(String(100), nullable=True)
    department = Column(String(100), nullable=True)
    experience = Column(String(50), nullable=True)
    bio = Column(Text, nullable=True)
    photo_url = Column(String(500), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    @property
    def needs_password_change(self) -> bool:
        """True on a parent's first login (still on DOB) or after an admin reset."""
        if self.must_change_password:
            return True
        return self.role == UserRole.parent and not self.hashed_password

    def __repr__(self) -> str:
        return f"<User id={self.id} role={self.role} name={self.name}>"

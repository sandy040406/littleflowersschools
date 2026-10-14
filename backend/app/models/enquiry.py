"""
Admission enquiry model — submitted from the public /enquiry form,
managed by admins in the portal.
"""

import enum

from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, func

from app.core.database import Base


class EnquiryStatus(str, enum.Enum):
    new = "new"
    contacted = "contacted"
    closed = "closed"


class Enquiry(Base):
    __tablename__ = "enquiries"

    id = Column(Integer, primary_key=True, index=True)
    parent_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)
    student_name = Column(String(100), nullable=True)
    grade_interested = Column(String(50), nullable=True)
    preferred_contact = Column(String(20), nullable=True, default="phone")
    message = Column(Text, nullable=True)

    status = Column(Enum(EnquiryStatus), default=EnquiryStatus.new, nullable=False, index=True)
    admin_notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

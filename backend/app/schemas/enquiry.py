"""
Pydantic schemas for admission enquiries.

Email is validated with a regex instead of `EmailStr` so we don't need
the extra `email-validator` dependency.
"""

import re
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.enquiry import EnquiryStatus

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PHONE_RE = re.compile(r"^[0-9+\-\s()]{7,20}$")


class EnquiryCreate(BaseModel):
    parent_name: str = Field(min_length=2, max_length=100)
    email: str = Field(max_length=255)
    phone: str = Field(max_length=20)
    student_name: Optional[str] = Field(default=None, max_length=100)
    grade_interested: Optional[str] = Field(default=None, max_length=50)
    preferred_contact: Optional[Literal["phone", "email", "whatsapp"]] = "phone"
    message: Optional[str] = Field(default=None, max_length=2000)
    enquiry_type: Optional[str] = Field(default="admission", max_length=20)
    subject: Optional[str] = Field(default=None, max_length=100)
    # Honeypot: real users never fill this (hidden field). Bots usually do.
    website: Optional[str] = None

    @field_validator("parent_name", "student_name", "message", "grade_interested", "subject")
    @classmethod
    def strip_text(cls, v):
        return v.strip() if isinstance(v, str) else v

    @field_validator("email")
    @classmethod
    def valid_email(cls, v: str) -> str:
        v = v.strip().lower()
        if not EMAIL_RE.match(v):
            raise ValueError("Please enter a valid email address")
        return v

    @field_validator("phone")
    @classmethod
    def valid_phone(cls, v: str) -> str:
        v = v.strip()
        if not PHONE_RE.match(v):
            raise ValueError("Please enter a valid phone number")
        return v


class ContactCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: str = Field(max_length=255)
    phone: str = Field(max_length=20)
    subject: Optional[str] = Field(default="General Inquiry", max_length=100)
    message: str = Field(min_length=5, max_length=2000)
    website: Optional[str] = None

    @field_validator("name", "message", "subject")
    @classmethod
    def strip_text(cls, v):
        return v.strip() if isinstance(v, str) else v

    @field_validator("email")
    @classmethod
    def valid_email(cls, v: str) -> str:
        v = v.strip().lower()
        if not EMAIL_RE.match(v):
            raise ValueError("Please enter a valid email address")
        return v

    @field_validator("phone")
    @classmethod
    def valid_phone(cls, v: str) -> str:
        v = v.strip()
        if not PHONE_RE.match(v):
            raise ValueError("Please enter a valid phone number")
        return v


class EnquiryUpdate(BaseModel):
    status: Optional[EnquiryStatus] = None
    admin_notes: Optional[str] = Field(default=None, max_length=2000)


class EnquiryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    parent_name: str
    email: str
    phone: str
    student_name: Optional[str] = None
    grade_interested: Optional[str] = None
    preferred_contact: Optional[str] = None
    message: Optional[str] = None
    enquiry_type: str = "admission"
    subject: Optional[str] = None
    status: EnquiryStatus
    admin_notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


class EnquiryStats(BaseModel):
    total: int
    new: int
    contacted: int
    closed: int

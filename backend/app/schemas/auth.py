"""
Pydantic schemas for authentication requests and responses.
"""

from pydantic import BaseModel, EmailStr
from typing import Optional


# ── Login Requests ──────────────────────────────────────────

class AdminTeacherLogin(BaseModel):
    """Login request for Admin and Teacher roles (email + password)."""
    email: str
    password: str


class ParentLogin(BaseModel):
    """Login request for Parent role (admission_number + date_of_birth)."""
    admission_number: str
    date_of_birth: str  # YYYY-MM-DD


# ── Token Responses ─────────────────────────────────────────

class TokenResponse(BaseModel):
    """JWT token pair returned after successful login."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    name: str


class RefreshRequest(BaseModel):
    """Request body for refreshing an access token."""
    refresh_token: str


# ── User Schemas ────────────────────────────────────────────

class UserOut(BaseModel):
    """Public user data returned by API."""
    id: int
    name: str
    role: str
    email: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool
    admission_number: Optional[str] = None
    designation: Optional[str] = None
    subject: Optional[str] = None
    department: Optional[str] = None

    model_config = {"from_attributes": True}


class CreateTeacher(BaseModel):
    """Admin creates a teacher account."""
    name: str
    email: str
    password: str
    phone: Optional[str] = None
    designation: Optional[str] = None
    subject: Optional[str] = None
    department: Optional[str] = None
    experience: Optional[str] = None
    bio: Optional[str] = None


class CreateStudent(BaseModel):
    """Admin creates a student (and auto-creates parent login)."""
    name: str
    admission_number: str
    date_of_birth: str  # YYYY-MM-DD
    class_name: str
    section: str = "A"
    roll_number: Optional[str] = None
    admission_date: Optional[str] = None
    parent_name: str
    parent_phone: Optional[str] = None
    parent_email: Optional[str] = None

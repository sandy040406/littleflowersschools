"""
Pydantic schemas for authentication requests and responses.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional


# ── Login Requests ──────────────────────────────────────────

class AdminTeacherLogin(BaseModel):
    """Login request for Admin and Teacher roles (email + password)."""
    email: str
    password: str


class ParentLogin(BaseModel):
    """
    Login request for Parent role (admission_number + credential).

    First login: `date_of_birth` (YYYY-MM-DD). Once the parent has set their
    own password, they sign in with `password` instead.
    """
    admission_number: str
    date_of_birth: Optional[str] = None  # YYYY-MM-DD
    password: Optional[str] = None


# ── Token Responses ─────────────────────────────────────────

class TokenResponse(BaseModel):
    """JWT token pair returned after successful login."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    name: str
    must_change_password: bool = False


class RefreshRequest(BaseModel):
    """Request body for refreshing an access token."""
    refresh_token: str


# ── Password management ─────────────────────────────────────

MIN_PASSWORD_LENGTH = 8


class ChangePasswordRequest(BaseModel):
    """Logged-in user changes their own password."""
    current_password: str
    new_password: str = Field(min_length=MIN_PASSWORD_LENGTH, max_length=128)


class ResetPasswordRequest(BaseModel):
    """Admin resets another user's password. Omit to auto-generate one."""
    new_password: Optional[str] = Field(default=None, min_length=MIN_PASSWORD_LENGTH, max_length=128)


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
    experience: Optional[str] = None
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    needs_password_change: bool = False

    model_config = {"from_attributes": True}


class TeacherProfileUpdate(BaseModel):
    """Teacher or Admin updates teacher details."""
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    designation: Optional[str] = None
    subject: Optional[str] = None
    department: Optional[str] = None
    experience: Optional[str] = None
    bio: Optional[str] = None
    photo_url: Optional[str] = None


class PublicFacultyOut(BaseModel):
    """Public-facing educator profile."""
    id: int
    name: str
    email: Optional[str] = None
    designation: Optional[str] = None
    subject: Optional[str] = None
    department: Optional[str] = None
    experience: Optional[str] = None
    bio: Optional[str] = None
    photo_url: Optional[str] = None

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

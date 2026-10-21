"""
Authentication routes.

  POST /api/auth/login/admin     → Admin/Teacher login (email + password)
  POST /api/auth/login/parent    → Parent login (admission_number + DOB)
  POST /api/auth/refresh         → Refresh access token
  GET  /api/auth/me              → Get current user profile
  POST /api/auth/change-password → Change own password (all roles)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    verify_password,
    hash_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.deps import get_current_user
from app.models.user import User, UserRole
from app.schemas.auth import (
    AdminTeacherLogin,
    ParentLogin,
    TokenResponse,
    RefreshRequest,
    UserOut,
    ChangePasswordRequest,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def _token_response(user: User) -> TokenResponse:
    """Issue a fresh token pair for `user`."""
    claims = {"sub": str(user.id), "role": user.role.value}
    return TokenResponse(
        access_token=create_access_token(data=claims),
        refresh_token=create_refresh_token(data=claims),
        role=user.role.value,
        user_id=user.id,
        name=user.name,
        must_change_password=user.needs_password_change,
    )


@router.post("/login/admin", response_model=TokenResponse)
def login_admin_teacher(body: AdminTeacherLogin, db: Session = Depends(get_db)):
    """
    Login for Admin and Teacher roles.
    Accepts email + password.
    """
    user = db.query(User).filter(
        User.email == body.email,
        User.role.in_([UserRole.admin, UserRole.teacher]),
    ).first()

    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been deactivated. Contact admin.",
        )

    return _token_response(user)


@router.post("/login/parent", response_model=TokenResponse)
def login_parent(body: ParentLogin, db: Session = Depends(get_db)):
    """
    Login for Parent role.
    Accepts admission_number (username) + credential:
      - first login (no password set yet): date_of_birth
      - afterwards: the password the parent chose
    """
    user = db.query(User).filter(
        User.admission_number == body.admission_number,
        User.role == UserRole.parent,
    ).first()

    invalid = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid admission number or credentials",
    )

    if not user:
        raise invalid

    if user.hashed_password:
        # Parent has set their own password — DOB no longer works.
        if not body.password or not verify_password(body.password, user.hashed_password):
            raise invalid
    else:
        # Compare DOB (stored as YYYY-MM-DD string)
        if not body.date_of_birth or user.date_of_birth != body.date_of_birth:
            raise invalid

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been deactivated. Contact admin.",
        )

    return _token_response(user)


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(body: RefreshRequest, db: Session = Depends(get_db)):
    """Exchange a valid refresh token for a new access + refresh token pair."""
    payload = decode_token(body.refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or deactivated",
        )

    return _token_response(user)


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Get the currently authenticated user's profile."""
    return current_user


@router.post("/change-password", response_model=TokenResponse)
def change_password(
    body: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Change the logged-in user's password (all roles).

    A parent still on their DOB proves identity with the DOB as the current
    password. Returns a fresh token pair with the force-change flag cleared.
    """
    if current_user.hashed_password:
        valid = verify_password(body.current_password, current_user.hashed_password)
    else:
        valid = (
            current_user.role == UserRole.parent
            and bool(current_user.date_of_birth)
            and body.current_password == current_user.date_of_birth
        )
    if not valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    if body.new_password == body.current_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from the current one",
        )
    if current_user.role == UserRole.parent and body.new_password == current_user.date_of_birth:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password cannot be your child's date of birth",
        )

    current_user.hashed_password = hash_password(body.new_password)
    current_user.must_change_password = False
    db.commit()
    db.refresh(current_user)
    return _token_response(current_user)


@router.get("/me/children")
def get_my_children(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get students associated with the logged-in parent."""
    if current_user.role != UserRole.parent:
        return []
    
    from app.models.student import Student
    students = db.query(Student).filter(Student.parent_id == current_user.id).all()
    
    return [
        {
            "id": s.id,
            "name": s.name,
            "admission_number": s.admission_number,
            "class_name": s.class_name,
            "section": s.section,
            "roll_number": s.roll_number,
            "admission_date": s.admission_date,
            "is_active": s.is_active,
        }
        for s in students
    ]

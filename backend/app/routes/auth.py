"""
Authentication routes.

  POST /api/auth/login/admin     → Admin/Teacher login (email + password)
  POST /api/auth/login/parent    → Parent login (admission_number + DOB)
  POST /api/auth/refresh         → Refresh access token
  GET  /api/auth/me              → Get current user profile
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    verify_password,
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
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


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

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
    refresh_token = create_refresh_token(data={"sub": str(user.id), "role": user.role.value})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        role=user.role.value,
        user_id=user.id,
        name=user.name,
    )


@router.post("/login/parent", response_model=TokenResponse)
def login_parent(body: ParentLogin, db: Session = Depends(get_db)):
    """
    Login for Parent role.
    Accepts admission_number (username) + date_of_birth (password).
    """
    user = db.query(User).filter(
        User.admission_number == body.admission_number,
        User.role == UserRole.parent,
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admission number or date of birth",
        )

    # Compare DOB (stored as YYYY-MM-DD string)
    if user.date_of_birth != body.date_of_birth:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admission number or date of birth",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been deactivated. Contact admin.",
        )

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
    refresh_token = create_refresh_token(data={"sub": str(user.id), "role": user.role.value})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        role=user.role.value,
        user_id=user.id,
        name=user.name,
    )


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

    new_access = create_access_token(data={"sub": str(user.id), "role": user.role.value})
    new_refresh = create_refresh_token(data={"sub": str(user.id), "role": user.role.value})

    return TokenResponse(
        access_token=new_access,
        refresh_token=new_refresh,
        role=user.role.value,
        user_id=user.id,
        name=user.name,
    )


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Get the currently authenticated user's profile."""
    return current_user

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

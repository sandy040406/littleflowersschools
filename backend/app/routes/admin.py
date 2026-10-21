"""
Admin-only routes for managing users (teachers, students/parents).

  GET    /api/admin/users              → List all users
  POST   /api/admin/teachers           → Create a teacher
  POST   /api/admin/students           → Create a student + parent login
  DELETE /api/admin/users/{user_id}    → Deactivate a user
  PUT    /api/admin/users/{user_id}/activate → Re-activate a user
  POST   /api/admin/users/{user_id}/reset-password → Reset a user's password
"""

from typing import Optional
import secrets
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_role
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.gallery import Media
from app.schemas.auth import CreateTeacher, CreateStudent, UserOut, ResetPasswordRequest, TeacherProfileUpdate, PublicFacultyOut

router = APIRouter(prefix="/api/admin", tags=["Admin"])

# All routes in this file require admin role
admin_only = require_role([UserRole.admin])


@router.get("/stats")
def get_system_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """Get total counts for the admin dashboard."""
    students = db.query(Student).count()
    teachers = db.query(User).filter(User.role == UserRole.teacher).count()
    parents = db.query(User).filter(User.role == UserRole.parent).count()
    media = db.query(Media).count()
    return {
        "total_students": students,
        "total_teachers": teachers,
        "total_parents": parents,
        "total_media": media,
    }

@router.get("/users", response_model=list[UserOut])
def list_users(
    role: Optional[str] = Query(None, description="Filter by role: admin, teacher, parent"),
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """List all users, optionally filtered by role."""
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    return query.order_by(User.created_at.desc()).all()


@router.put("/teachers/{teacher_id}", response_model=UserOut)
def update_teacher(
    teacher_id: int,
    body: TeacherProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """Admin updates teacher profile information."""
    teacher = db.query(User).filter(User.id == teacher_id, User.role == UserRole.teacher).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    if body.email and body.email != teacher.email:
        existing = db.query(User).filter(User.email == body.email, User.id != teacher_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use by another user")
        teacher.email = body.email

    if body.name is not None:
        teacher.name = body.name.strip()
    if body.phone is not None:
        teacher.phone = body.phone.strip() or None
    if body.designation is not None:
        teacher.designation = body.designation.strip() or None
    if body.subject is not None:
        teacher.subject = body.subject.strip() or None
    if body.department is not None:
        teacher.department = body.department.strip() or None
    if body.experience is not None:
        teacher.experience = body.experience.strip() or None
    if body.bio is not None:
        teacher.bio = body.bio.strip() or None
    if body.photo_url is not None:
        teacher.photo_url = body.photo_url.strip() or None

    db.commit()
    db.refresh(teacher)
    return teacher


@router.post("/teachers", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_teacher(
    body: CreateTeacher,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """Create a new teacher account (email + password login)."""
    # Check if email already exists
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A user with email {body.email} already exists.",
        )

    teacher = User(
        role=UserRole.teacher,
        name=body.name,
        email=body.email,
        hashed_password=hash_password(body.password),
        phone=body.phone,
        designation=body.designation,
        subject=body.subject,
        department=body.department,
        experience=body.experience,
        bio=body.bio,
    )
    db.add(teacher)
    db.commit()
    db.refresh(teacher)
    return teacher


@router.post("/students", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_student(
    body: CreateStudent,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """
    Create a new student record AND auto-create the parent login.
    The parent will login using:
      - username: student's admission_number
      - password: student's date_of_birth (YYYY-MM-DD)
    """
    # Check if admission_number already exists
    existing_student = db.query(Student).filter(
        Student.admission_number == body.admission_number
    ).first()
    if existing_student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A student with admission number {body.admission_number} already exists.",
        )

    # Check if parent with this admission_number already exists
    existing_parent = db.query(User).filter(
        User.admission_number == body.admission_number
    ).first()

    if existing_parent:
        parent_user = existing_parent
    else:
        # Create parent user account
        parent_user = User(
            role=UserRole.parent,
            name=body.parent_name,
            phone=body.parent_phone,
            email=body.parent_email,
            admission_number=body.admission_number,
            date_of_birth=body.date_of_birth,
        )
        db.add(parent_user)
        db.flush()  # Get the parent ID

    # Create student record
    student = Student(
        name=body.name,
        admission_number=body.admission_number,
        date_of_birth=body.date_of_birth,
        class_name=body.class_name,
        section=body.section,
        roll_number=body.roll_number,
        admission_date=body.admission_date,
        parent_id=parent_user.id,
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    db.refresh(parent_user)

    return {
        "message": "Student and parent login created successfully",
        "student": {
            "id": student.id,
            "name": student.name,
            "admission_number": student.admission_number,
            "class_name": student.class_name,
        },
        "parent_login": {
            "user_id": parent_user.id,
            "username": body.admission_number,
            "password": "Student's date of birth (YYYY-MM-DD)",
        },
    }


@router.delete("/users/{user_id}")
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """Deactivate (soft-delete) a user. They will not be able to login."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role == UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate the admin account.",
        )

    user.is_active = False
    db.commit()
    return {"message": f"User '{user.name}' has been deactivated."}


@router.put("/users/{user_id}/activate")
def activate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """Re-activate a previously deactivated user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = True
    db.commit()
    return {"message": f"User '{user.name}' has been re-activated."}


@router.post("/users/{user_id}/reset-password")
def reset_user_password(
    user_id: int,
    body: ResetPasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """
    Reset another user's password.

    - Teacher / admin: sets a new (given or generated) temporary password and
      forces them to change it at next login. The temporary password is
      returned once — share it with the user securely.
    - Parent: clears their password so they sign in with the child's date of
      birth again, and must then choose a new password.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Use 'Change Password' to update your own password.",
        )

    if user.role == UserRole.parent:
        user.hashed_password = None
        user.must_change_password = True
        db.commit()
        return {
            "message": f"Password for '{user.name}' was reset. They can sign in with their child's date of birth and will be asked to choose a new password.",
            "temporary_password": None,
        }

    temp_password = body.new_password or secrets.token_urlsafe(9)
    user.hashed_password = hash_password(temp_password)
    user.must_change_password = True
    db.commit()
    return {
        "message": f"Password for '{user.name}' was reset. They must change it at next login.",
        "temporary_password": temp_password,
    }

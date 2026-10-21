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
import csv
import io
import secrets
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.deps import require_role
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.gallery import Media
from app.models.enquiry import Enquiry
from app.schemas.auth import (
    CreateTeacher,
    CreateStudent,
    UserOut,
    ResetPasswordRequest,
    TeacherProfileUpdate,
    PublicFacultyOut,
    StudentOut,
    StudentUpdate,
    PromoteClassRequest,
    UserUpdate,
)

router = APIRouter(prefix="/api/admin", tags=["Admin"])

# All routes in this file require admin role
admin_only = require_role([UserRole.admin])


@router.get("/stats")
def get_system_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """Get rich metrics for the admin dashboard."""
    students = db.query(Student).count()
    active_students = db.query(Student).filter(Student.is_active == True).count()
    teachers = db.query(User).filter(User.role == UserRole.teacher).count()
    parents = db.query(User).filter(User.role == UserRole.parent).count()
    media = db.query(Media).count()
    enquiries_total = db.query(Enquiry).count()
    enquiries_new = db.query(Enquiry).filter(Enquiry.status == "new").count()

    # Class breakdown
    class_rows = (
        db.query(Student.class_name, func.count(Student.id))
        .filter(Student.is_active == True)
        .group_by(Student.class_name)
        .all()
    )
    classes_summary = [{"class_name": r[0], "count": r[1]} for r in class_rows if r[0]]

    return {
        "total_students": students,
        "active_students": active_students,
        "total_teachers": teachers,
        "total_parents": parents,
        "total_media": media,
        "total_enquiries": enquiries_total,
        "pending_enquiries": enquiries_new,
        "classes": classes_summary,
    }


@router.get("/activity")
def get_system_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """Get real recent system activities across users, enquiries, and media."""
    activities = []

    # Recent enquiries (up to 5)
    recent_enquiries = (
        db.query(Enquiry)
        .order_by(Enquiry.created_at.desc())
        .limit(5)
        .all()
    )
    for eq in recent_enquiries:
        activities.append({
            "type": "enquiry",
            "title": f"New enquiry from {eq.parent_name}",
            "detail": f"{eq.student_name or 'General enquiry'} ({eq.grade_interested or 'N/A'}) - {eq.status.capitalize()}",
            "created_at": eq.created_at.isoformat() if eq.created_at else None,
        })

    # Recent students registered (up to 5)
    recent_students = (
        db.query(Student)
        .order_by(Student.created_at.desc())
        .limit(5)
        .all()
    )
    for st in recent_students:
        activities.append({
            "type": "student",
            "title": f"Student registered: {st.name}",
            "detail": f"{st.class_name} ({st.section}) · Adm #{st.admission_number}",
            "created_at": st.created_at.isoformat() if st.created_at else None,
        })

    # Recent media uploads (up to 5)
    recent_media = (
        db.query(Media)
        .order_by(Media.created_at.desc())
        .limit(5)
        .all()
    )
    for med in recent_media:
        activities.append({
            "type": "media",
            "title": f"Media uploaded: {med.title or med.file_name}",
            "detail": f"Type: {med.media_type.value if hasattr(med.media_type, 'value') else med.media_type}",
            "created_at": med.created_at.isoformat() if med.created_at else None,
        })

    # Sort all by created_at desc and return top 10
    activities.sort(key=lambda x: x.get("created_at") or "", reverse=True)
    return activities[:10]

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


@router.put("/users/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    body: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """Admin updates generic user information (name, email, phone)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if body.email is not None:
        clean_email = body.email.strip().lower() if body.email.strip() else None
        if clean_email:
            existing = db.query(User).filter(User.email == clean_email, User.id != user_id).first()
            if existing:
                raise HTTPException(status_code=400, detail=f"Email '{clean_email}' is already in use by another user.")
        user.email = clean_email

    if body.name is not None and body.name.strip():
        user.name = body.name.strip()

    if body.phone is not None:
        user.phone = body.phone.strip() or None

    db.commit()
    db.refresh(user)
    return user


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

    clean_email = body.parent_email.strip() if body.parent_email and body.parent_email.strip() else None
    clean_phone = body.parent_phone.strip() if body.parent_phone and body.parent_phone.strip() else None

    # Check if parent exists by admission_number, or by email, or by phone
    parent_user = db.query(User).filter(
        User.admission_number == body.admission_number,
        User.role == UserRole.parent
    ).first()

    if not parent_user and clean_email:
        parent_user = db.query(User).filter(User.email == clean_email, User.role == UserRole.parent).first()
    if not parent_user and clean_phone:
        parent_user = db.query(User).filter(User.phone == clean_phone, User.role == UserRole.parent).first()

    if not parent_user:
        # Create parent user account
        parent_user = User(
            role=UserRole.parent,
            name=body.parent_name.strip(),
            phone=clean_phone,
            email=clean_email,
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


def _normalize_dob(dob_str: str) -> str:
    """Normalizes DOB to YYYY-MM-DD from various formats (YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY)."""
    s = dob_str.strip().replace("/", "-")
    parts = s.split("-")
    if len(parts) == 3:
        if len(parts[0]) == 4:
            return f"{int(parts[0]):04d}-{int(parts[1]):02d}-{int(parts[2]):02d}"
        elif len(parts[2]) == 4:
            return f"{int(parts[2]):04d}-{int(parts[1]):02d}-{int(parts[0]):02d}"
    return dob_str


@router.get("/students", response_model=list[StudentOut])
def list_students(
    search: Optional[str] = Query(None, description="Search by name, admission number, roll number, or parent name"),
    class_name: Optional[str] = Query(None, description="Filter by class"),
    section: Optional[str] = Query(None, description="Filter by section"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """List students with filtering and search."""
    query = db.query(Student)
    if class_name:
        query = query.filter(Student.class_name == class_name)
    if section:
        query = query.filter(Student.section == section)
    if is_active is not None:
        query = query.filter(Student.is_active == is_active)
    if search:
        s = f"%{search.strip().lower()}%"
        query = query.outerjoin(User, Student.parent_id == User.id).filter(
            func.lower(Student.name).like(s) |
            func.lower(Student.admission_number).like(s) |
            func.lower(Student.roll_number).like(s) |
            func.lower(User.name).like(s)
        )
    return query.order_by(Student.class_name, Student.section, Student.roll_number, Student.name).all()


@router.get("/students/{student_id}", response_model=StudentOut)
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """Get single student details."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@router.put("/students/{student_id}", response_model=StudentOut)
def update_student(
    student_id: int,
    body: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """Update student record."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if body.name is not None and body.name.strip():
        student.name = body.name.strip()
    if body.date_of_birth is not None and body.date_of_birth.strip():
        student.date_of_birth = _normalize_dob(body.date_of_birth.strip())
        if student.parent and not student.parent.hashed_password:
            student.parent.date_of_birth = student.date_of_birth
    if body.class_name is not None and body.class_name.strip():
        student.class_name = body.class_name.strip()
    if body.section is not None and body.section.strip():
        student.section = body.section.strip()
    if body.roll_number is not None:
        student.roll_number = body.roll_number.strip() or None
    if body.admission_date is not None:
        student.admission_date = body.admission_date.strip() or None
    if body.is_active is not None:
        student.is_active = body.is_active

    db.commit()
    db.refresh(student)
    return student


@router.delete("/students/{student_id}")
def deactivate_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """Deactivate (soft-delete) a student."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student.is_active = False
    db.commit()
    return {"message": f"Student '{student.name}' (Adm #{student.admission_number}) has been deactivated."}


@router.put("/students/{student_id}/activate")
def activate_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """Reactivate a previously deactivated student."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student.is_active = True
    db.commit()
    return {"message": f"Student '{student.name}' (Adm #{student.admission_number}) has been reactivated."}


@router.post("/students/promote")
def promote_class(
    body: PromoteClassRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """Batch promote all active students from one class to another."""
    from_cls = body.from_class.strip()
    to_cls = body.to_class.strip()
    if not from_cls or not to_cls:
        raise HTTPException(status_code=400, detail="from_class and to_class are required.")

    query = db.query(Student).filter(Student.class_name == from_cls, Student.is_active == True)
    if body.from_section and body.from_section.strip():
        query = query.filter(Student.section == body.from_section.strip())

    students_to_promote = query.all()
    count = len(students_to_promote)
    for st in students_to_promote:
        st.class_name = to_cls
        if body.to_section and body.to_section.strip():
            st.section = body.to_section.strip()

    db.commit()
    return {
        "promoted_count": count,
        "from_class": from_cls,
        "to_class": to_cls,
        "message": f"Successfully promoted {count} student(s) from {from_cls} to {to_cls}."
    }


@router.post("/students/import-csv")
async def import_students_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """Bulk import students and auto-create parent logins from a CSV file."""
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a .csv file.")

    contents = await file.read()
    try:
        decoded = contents.decode("utf-8-sig")
    except UnicodeDecodeError:
        try:
            decoded = contents.decode("latin-1")
        except Exception:
            raise HTTPException(status_code=400, detail="Could not decode CSV file. Please upload a UTF-8 CSV.")

    reader = csv.DictReader(io.StringIO(decoded))
    if not reader.fieldnames:
        raise HTTPException(status_code=400, detail="CSV file is empty or missing headers.")

    created_count = 0
    updated_count = 0
    errors = []

    for row_idx, raw_row in enumerate(reader, start=2):
        row = {k.strip().lower(): (v.strip() if v else "") for k, v in raw_row.items() if k}
        name = row.get("name") or row.get("student_name") or row.get("student")
        adm_no = (
            row.get("admission_number")
            or row.get("admission_no")
            or row.get("admission_num")
            or row.get("adm_no")
        )
        dob = row.get("date_of_birth") or row.get("dob")
        class_name = row.get("class_name") or row.get("class") or row.get("grade")
        section = row.get("section") or "A"
        roll_no = row.get("roll_number") or row.get("roll_no") or None
        adm_date = row.get("admission_date") or None
        parent_name = (
            row.get("parent_name")
            or row.get("father_name")
            or row.get("mother_name")
            or (f"Parent of {name}" if name else "Parent")
        )
        parent_phone = row.get("parent_phone") or row.get("phone") or row.get("mobile") or None
        parent_email = row.get("parent_email") or row.get("email") or None

        if not name or not adm_no or not dob or not class_name:
            errors.append(f"Row {row_idx}: Missing required field (name, admission_number, dob, or class_name).")
            continue

        clean_dob = _normalize_dob(dob)

        # Check if student exists
        existing_student = db.query(Student).filter(Student.admission_number == adm_no).first()
        if existing_student:
            existing_student.name = name
            existing_student.date_of_birth = clean_dob
            existing_student.class_name = class_name
            existing_student.section = section
            if roll_no:
                existing_student.roll_number = roll_no
            if adm_date:
                existing_student.admission_date = adm_date
            existing_student.is_active = True

            if existing_student.parent and not existing_student.parent.hashed_password:
                existing_student.parent.date_of_birth = clean_dob
            updated_count += 1
        else:
            # Check or create parent
            parent_user = db.query(User).filter(
                User.admission_number == adm_no,
                User.role == UserRole.parent
            ).first()
            if not parent_user and parent_email:
                parent_user = db.query(User).filter(User.email == parent_email, User.role == UserRole.parent).first()
            if not parent_user and parent_phone:
                parent_user = db.query(User).filter(User.phone == parent_phone, User.role == UserRole.parent).first()

            if not parent_user:
                parent_user = User(
                    role=UserRole.parent,
                    name=parent_name,
                    phone=parent_phone,
                    email=parent_email,
                    admission_number=adm_no,
                    date_of_birth=clean_dob,
                )
                db.add(parent_user)
                db.flush()

            new_student = Student(
                name=name,
                admission_number=adm_no,
                date_of_birth=clean_dob,
                class_name=class_name,
                section=section,
                roll_number=roll_no,
                admission_date=adm_date,
                parent_id=parent_user.id,
                is_active=True,
            )
            db.add(new_student)
            created_count += 1

    db.commit()
    return {
        "created": created_count,
        "updated": updated_count,
        "errors": errors,
        "total_processed": created_count + updated_count,
        "message": f"CSV import finished: {created_count} student(s) created, {updated_count} updated, {len(errors)} error(s)."
    }

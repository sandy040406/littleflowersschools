"""
Admission enquiry routes.

- POST   /api/enquiries          public — submit an enquiry
- GET    /api/enquiries          admin  — list (optional ?status=new)
- GET    /api/enquiries/stats    admin  — counts by status
- PUT    /api/enquiries/{id}     admin  — update status / notes
- DELETE /api/enquiries/{id}     admin  — delete
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_role
from app.models.user import User, UserRole
from app.models.enquiry import Enquiry, EnquiryStatus
from app.schemas.enquiry import EnquiryCreate, EnquiryUpdate, EnquiryOut, EnquiryStats

router = APIRouter(prefix="/api/enquiries", tags=["Admission Enquiries"])

admin_only = require_role([UserRole.admin])


@router.post("", response_model=EnquiryOut, status_code=201)
def create_enquiry(body: EnquiryCreate, db: Session = Depends(get_db)):
    """Public endpoint for parents to submit an admission enquiry."""
    if body.website:  # honeypot tripped — pretend success, store nothing
        raise HTTPException(status_code=400, detail="Invalid submission")

    data = body.model_dump(exclude={"website"})
    enquiry = Enquiry(**data)
    db.add(enquiry)
    db.commit()
    db.refresh(enquiry)
    return enquiry


@router.get("", response_model=list[EnquiryOut])
def list_enquiries(
    status: Optional[EnquiryStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """List admission enquiries, newest first (Admin only)."""
    q = db.query(Enquiry)
    if status is not None:
        q = q.filter(Enquiry.status == status)
    return q.order_by(Enquiry.created_at.desc(), Enquiry.id.desc()).all()


@router.get("/stats", response_model=EnquiryStats)
def enquiry_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """Counts of enquiries by status (Admin only)."""
    rows = db.query(Enquiry.status, func.count(Enquiry.id)).group_by(Enquiry.status).all()
    counts = {s.value: 0 for s in EnquiryStatus}
    for status, count in rows:
        key = status.value if isinstance(status, EnquiryStatus) else str(status)
        counts[key] = count
    return EnquiryStats(total=sum(counts.values()), **counts)


@router.put("/{enquiry_id}", response_model=EnquiryOut)
def update_enquiry(
    enquiry_id: int,
    body: EnquiryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """Update enquiry status or admin notes (Admin only)."""
    enquiry = db.get(Enquiry, enquiry_id)
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found")

    if body.status is not None:
        enquiry.status = body.status
    if body.admin_notes is not None:
        enquiry.admin_notes = body.admin_notes.strip() or None

    db.commit()
    db.refresh(enquiry)
    return enquiry


@router.delete("/{enquiry_id}")
def delete_enquiry(
    enquiry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """Delete an enquiry (Admin only)."""
    enquiry = db.get(Enquiry, enquiry_id)
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found")

    db.delete(enquiry)
    db.commit()
    return {"message": "Enquiry deleted."}

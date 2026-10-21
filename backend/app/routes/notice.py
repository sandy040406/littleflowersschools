"""
School Notices & Circulars and Calendar Routes.

Public:
  GET /api/notices             → Active whole-school notices & circulars
  GET /api/notices/calendar    → Aggregated upcoming events & academic dates

Parent Portal:
  GET /api/notices/parent      → Whole school + parent's children's class-specific notices

Admin Portal:
  GET    /api/notices/admin                 → List all notices (filtered/searchable)
  POST   /api/notices/admin                 → Create new notice
  PUT    /api/notices/admin/{id}            → Update notice
  DELETE /api/notices/admin/{id}            → Delete notice
  PATCH  /api/notices/admin/{id}/toggle-pinned → Toggle pinned status
  PATCH  /api/notices/admin/{id}/toggle-active → Toggle active status
"""

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, desc
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_role
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.notice import Notice
from app.models.gallery import Event
from app.schemas.notice import (
    NoticeCreate, NoticeUpdate, NoticeOut, CalendarItemOut
)

router = APIRouter(prefix="/api/notices", tags=["Notices & Circulars"])

admin_only = require_role([UserRole.admin])
parent_only = require_role([UserRole.parent])


def notice_to_out(n: Notice) -> dict:
    return {
        "id": n.id,
        "title": n.title,
        "content": n.content,
        "category": n.category,
        "target_class": n.target_class,
        "attachment_url": n.attachment_url,
        "publish_date": n.publish_date,
        "is_pinned": n.is_pinned,
        "is_active": n.is_active,
        "created_by": n.created_by,
        "author_name": n.author.name if n.author else "School Administration",
        "created_at": n.created_at,
        "updated_at": n.updated_at,
    }


# ── Public Endpoints ─────────────────────────────────────────

@router.get("", response_model=list[NoticeOut])
def get_public_notices(
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search in title or content"),
    db: Session = Depends(get_db),
):
    """
    Publicly visible notices. Returns only active notices targeted to the whole school
    (target_class is null or empty).
    """
    q = db.query(Notice).filter(Notice.is_active == True)
    q = q.filter(or_(Notice.target_class == None, Notice.target_class == ""))  # noqa: E711

    if category and category.lower() != "all":
        q = q.filter(Notice.category == category.lower())

    if search:
        term = f"%{search.strip()}%"
        q = q.filter(or_(Notice.title.ilike(term), Notice.content.ilike(term)))

    items = q.order_by(desc(Notice.is_pinned), desc(Notice.publish_date), desc(Notice.id)).all()
    return [notice_to_out(n) for n in items]


@router.get("/calendar", response_model=list[CalendarItemOut])
def get_calendar_items(
    db: Session = Depends(get_db),
):
    """
    Unified public timeline combining school events and circulars/notices.
    """
    results: list[CalendarItemOut] = []

    # 1. School Events
    events = db.query(Event).order_by(desc(Event.event_date)).limit(25).all()
    for ev in events:
        results.append(
            CalendarItemOut(
                id=f"event-{ev.id}",
                item_type="event",
                title=ev.title,
                description=ev.description,
                date=ev.event_date,
                category=ev.category,
                target_class=ev.class_name,
                cover_url=ev.cover_url,
            )
        )

    # 2. Active Notices
    notices = (
        db.query(Notice)
        .filter(Notice.is_active == True)
        .order_by(desc(Notice.publish_date))
        .limit(25)
        .all()
    )
    for n in notices:
        results.append(
            CalendarItemOut(
                id=f"notice-{n.id}",
                item_type="notice",
                title=n.title,
                description=n.content[:150] + ("..." if len(n.content) > 150 else ""),
                date=n.publish_date,
                category=n.category,
                target_class=n.target_class,
                cover_url=n.attachment_url,
            )
        )

    # Sort descending by date
    results.sort(key=lambda x: x.date, reverse=True)
    return results


# ── Parent Portal Endpoints ───────────────────────────────────

@router.get("/parent", response_model=list[NoticeOut])
def get_parent_notices(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(parent_only),
):
    """
    Returns notices relevant to this parent: whole school notices + class-targeted notices
    for any active child enrolled under this parent.
    """
    children = (
        db.query(Student)
        .filter(Student.parent_id == current_user.id, Student.is_active == True)
        .all()
    )
    enrolled_classes = {c.class_name for c in children if c.class_name}

    q = db.query(Notice).filter(Notice.is_active == True)
    
    if enrolled_classes:
        q = q.filter(
            or_(
                Notice.target_class == None,  # noqa: E711
                Notice.target_class == "",
                Notice.target_class.in_(enrolled_classes),
            )
        )
    else:
        q = q.filter(or_(Notice.target_class == None, Notice.target_class == ""))  # noqa: E711

    if category and category.lower() != "all":
        q = q.filter(Notice.category == category.lower())

    if search:
        term = f"%{search.strip()}%"
        q = q.filter(or_(Notice.title.ilike(term), Notice.content.ilike(term)))

    items = q.order_by(desc(Notice.is_pinned), desc(Notice.publish_date), desc(Notice.id)).all()
    return [notice_to_out(n) for n in items]


# ── Admin Portal Endpoints ────────────────────────────────────

@router.get("/admin", response_model=list[NoticeOut])
def get_admin_notices(
    category: Optional[str] = Query(None),
    target_class: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """
    Admin listing of all notices with filtering and search.
    """
    q = db.query(Notice)

    if category and category.lower() != "all":
        q = q.filter(Notice.category == category.lower())

    if target_class is not None:
        if target_class == "__whole__":
            q = q.filter(or_(Notice.target_class == None, Notice.target_class == ""))  # noqa: E711
        elif target_class != "all" and target_class != "":
            q = q.filter(Notice.target_class == target_class)

    if is_active is not None:
        q = q.filter(Notice.is_active == is_active)

    if search:
        term = f"%{search.strip()}%"
        q = q.filter(or_(Notice.title.ilike(term), Notice.content.ilike(term)))

    items = q.order_by(desc(Notice.is_pinned), desc(Notice.publish_date), desc(Notice.id)).all()
    return [notice_to_out(n) for n in items]


@router.post("/admin", response_model=NoticeOut, status_code=status.HTTP_201_CREATED)
def create_notice(
    body: NoticeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """
    Admin creates a new circular or notice.
    """
    publish_date = body.publish_date.strip() if body.publish_date else date.today().isoformat()
    target_class = body.target_class.strip() if body.target_class else None
    if target_class == "" or target_class == "Whole School":
        target_class = None

    notice = Notice(
        title=body.title.strip(),
        content=body.content.strip(),
        category=body.category.lower(),
        target_class=target_class,
        attachment_url=body.attachment_url.strip() if body.attachment_url else None,
        publish_date=publish_date,
        is_pinned=body.is_pinned,
        is_active=body.is_active,
        created_by=current_user.id,
    )
    db.add(notice)
    db.commit()
    db.refresh(notice)
    return notice_to_out(notice)


@router.put("/admin/{notice_id}", response_model=NoticeOut)
def update_notice(
    notice_id: int,
    body: NoticeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """
    Admin updates an existing notice.
    """
    notice = db.get(Notice, notice_id)
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")

    dump = body.model_dump(exclude_unset=True)
    if "title" in dump and dump["title"] is not None:
        notice.title = dump["title"].strip()
    if "content" in dump and dump["content"] is not None:
        notice.content = dump["content"].strip()
    if "category" in dump and dump["category"] is not None:
        notice.category = dump["category"].lower()
    if "target_class" in dump:
        tc = dump["target_class"]
        notice.target_class = None if not tc or tc == "Whole School" else tc.strip()
    if "attachment_url" in dump:
        notice.attachment_url = dump["attachment_url"].strip() if dump["attachment_url"] else None
    if "publish_date" in dump and dump["publish_date"]:
        notice.publish_date = dump["publish_date"].strip()
    if "is_pinned" in dump and dump["is_pinned"] is not None:
        notice.is_pinned = dump["is_pinned"]
    if "is_active" in dump and dump["is_active"] is not None:
        notice.is_active = dump["is_active"]

    db.commit()
    db.refresh(notice)
    return notice_to_out(notice)


@router.delete("/admin/{notice_id}")
def delete_notice(
    notice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """
    Admin deletes a notice.
    """
    notice = db.get(Notice, notice_id)
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")

    db.delete(notice)
    db.commit()
    return {"message": "Notice deleted successfully"}


@router.patch("/admin/{notice_id}/toggle-pinned", response_model=NoticeOut)
def toggle_pinned(
    notice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """
    Admin toggles pinned status of a notice.
    """
    notice = db.get(Notice, notice_id)
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")

    notice.is_pinned = not notice.is_pinned
    db.commit()
    db.refresh(notice)
    return notice_to_out(notice)


@router.patch("/admin/{notice_id}/toggle-active", response_model=NoticeOut)
def toggle_active(
    notice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """
    Admin toggles active status of a notice.
    """
    notice = db.get(Notice, notice_id)
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")

    notice.is_active = not notice.is_active
    db.commit()
    db.refresh(notice)
    return notice_to_out(notice)

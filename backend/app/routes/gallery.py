"""
Gallery routes — events & media.

  GET    /api/gallery/events                 → list events visible to caller
  GET    /api/gallery/events/{id}            → event detail + visible media
  POST   /api/gallery/events                 → create event   (teacher/admin)
  PATCH  /api/gallery/events/{id}            → update event   (owner/admin)
  DELETE /api/gallery/events/{id}            → delete event   (owner/admin)
  POST   /api/gallery/events/{id}/media      → upload files   (teacher/admin)
  DELETE /api/gallery/media/{id}             → delete a file  (uploader/admin)

Public visitors see only public events/media. Any logged-in user
(parent, teacher, admin) sees everything, including private events —
parents are not restricted to their own child's class.
"""

from typing import List, Optional

from fastapi import (
    APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
)
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core import storage
from app.core.database import get_db
from app.core.deps import require_role
from app.core.security import decode_token
from app.models.gallery import Event, Media, MediaType, Visibility
from app.models.user import User, UserRole
from app.schemas.gallery import (
    EventCreate, EventUpdate, EventOut, EventDetailOut, MediaOut
)

router = APIRouter(prefix="/api/gallery", tags=["Gallery"])

optional_bearer = HTTPBearer(auto_error=False)
staff_only = require_role([UserRole.admin, UserRole.teacher])

CHUNK = 1024 * 1024  # 1 MB


# ── Helpers ─────────────────────────────────────────────────

def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_bearer),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Like get_current_user, but returns None for anonymous visitors."""
    if credentials is None:
        return None
    payload = decode_token(credentials.credentials)
    if not payload or payload.get("type") != "access" or not payload.get("sub"):
        return None
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    return user if user and user.is_active else None


def can_view_event(event: Event, user: Optional[User]) -> bool:
    """Public events are visible to all; private ones to any logged-in user."""
    return event.visibility == Visibility.public or user is not None


def visible_media(event: Event, user: Optional[User]) -> list[Media]:
    if user is None:
        return [m for m in event.media if m.visibility == Visibility.public]
    return list(event.media)


def to_event_out(event: Event, media: list[Media]) -> dict:
    return {
        "id": event.id,
        "title": event.title,
        "description": event.description,
        "event_date": event.event_date,
        "category": event.category,
        "class_name": event.class_name,
        "section": event.section,
        "visibility": event.visibility,
        "cover_url": event.cover_url,
        "photo_count": sum(1 for m in media if m.media_type == MediaType.image),
        "video_count": sum(1 for m in media if m.media_type == MediaType.video),
        "created_by": event.created_by,
        "created_at": event.created_at,
    }


def get_event_or_404(db: Session, event_id: int) -> Event:
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Event not found")
    return event


def ensure_owner_or_admin(owner_id: Optional[int], user: User) -> None:
    if user.role != UserRole.admin and owner_id != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You can only modify your own items")


async def read_limited(file: UploadFile, limit: int) -> bytes:
    """Read an upload in chunks, aborting as soon as it exceeds `limit`."""
    buf = bytearray()
    while chunk := await file.read(CHUNK):
        buf.extend(chunk)
        if len(buf) > limit:
            raise HTTPException(
                status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                f"'{file.filename}' exceeds {limit // (1024 * 1024)}MB limit",
            )
    return bytes(buf)


# ── Events ──────────────────────────────────────────────────

@router.get("/events", response_model=List[EventOut])
def list_events(
    category: Optional[str] = Query(None),
    class_name: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user),
):
    q = db.query(Event)
    if category and category != "all":
        q = q.filter(Event.category == category)
    if class_name:
        q = q.filter(Event.class_name == class_name)
    events = q.order_by(Event.event_date.desc(), Event.id.desc()).all()

    return [
        to_event_out(e, visible_media(e, user))
        for e in events if can_view_event(e, user)
    ]


@router.get("/events/{event_id}", response_model=EventDetailOut)
def get_event(
    event_id: int,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user),
):
    event = get_event_or_404(db, event_id)
    if not can_view_event(event, user):
        # 404 rather than 403 so private events aren't discoverable
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Event not found")
    media = visible_media(event, user)
    return {**to_event_out(event, media), "media": media}


@router.post("/events", response_model=EventOut, status_code=status.HTTP_201_CREATED)
def create_event(
    data: EventCreate,
    db: Session = Depends(get_db),
    user: User = Depends(staff_only),
):
    event = Event(**data.model_dump(), created_by=user.id)
    db.add(event)
    db.commit()
    db.refresh(event)
    return to_event_out(event, [])


@router.patch("/events/{event_id}", response_model=EventOut)
def update_event(
    event_id: int,
    data: EventUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(staff_only),
):
    event = get_event_or_404(db, event_id)
    ensure_owner_or_admin(event.created_by, user)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(event, field, value)
    db.commit()
    db.refresh(event)
    return to_event_out(event, list(event.media))


@router.delete("/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(staff_only),
):
    event = get_event_or_404(db, event_id)
    ensure_owner_or_admin(event.created_by, user)
    keys = [m.storage_key for m in event.media]
    db.delete(event)
    db.commit()
    for key in keys:
        storage.delete_file(key)


# ── Media ───────────────────────────────────────────────────

@router.post(
    "/events/{event_id}/media",
    response_model=List[MediaOut],
    status_code=status.HTTP_201_CREATED,
)
async def upload_media(
    event_id: int,
    files: List[UploadFile] = File(...),
    visibility: Visibility = Form(Visibility.public),
    db: Session = Depends(get_db),
    user: User = Depends(staff_only),
):
    event = get_event_or_404(db, event_id)

    # Validate all types first so we don't half-upload a batch
    for f in files:
        if storage.detect_media_type(f.content_type) is None:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                f"Unsupported file type for '{f.filename}' ({f.content_type})",
            )

    saved_keys: list[str] = []
    created: list[Media] = []
    try:
        for f in files:
            mtype = storage.detect_media_type(f.content_type)
            data = await read_limited(f, storage.max_bytes_for(mtype))
            key = storage.build_key(f"events/{event.id}", f.filename)
            url = storage.save_file(key, data)
            saved_keys.append(key)

            media = Media(
                event_id=event.id,
                uploaded_by=user.id,
                file_name=f.filename or key.rsplit("/", 1)[-1],
                storage_key=key,
                url=url,
                media_type=MediaType(mtype),
                content_type=f.content_type,
                file_size=len(data),
                visibility=visibility,
            )
            db.add(media)
            created.append(media)

            # First image becomes the event cover automatically
            if event.cover_url is None and mtype == "image":
                event.cover_url = url

        db.commit()
    except Exception:
        db.rollback()
        for key in saved_keys:
            storage.delete_file(key)
        raise

    for m in created:
        db.refresh(m)
    return created


@router.delete("/media/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_media(
    media_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(staff_only),
):
    media = db.query(Media).filter(Media.id == media_id).first()
    if not media:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Media not found")
    ensure_owner_or_admin(media.uploaded_by, user)

    event = media.event
    key, url = media.storage_key, media.url
    db.delete(media)

    # If this was the cover, pick the next available image (or clear it)
    if event.cover_url == url:
        nxt = next(
            (m for m in event.media if m.id != media_id and m.media_type == MediaType.image),
            None,
        )
        event.cover_url = nxt.url if nxt else None

    db.commit()
    storage.delete_file(key)

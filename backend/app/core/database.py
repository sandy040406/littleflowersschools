"""
Database engine, session factory, and base model.
Works with both SQLite (dev) and PostgreSQL (prod).
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import get_settings

settings = get_settings()

def get_engine_and_url(raw_url: str):
    """
    Parse and configure engine for SQLite or PostgreSQL (Neon/Supabase/Render).
    Automatically maps postgres:// or postgresql:// to postgresql+psycopg://.
    """
    url = raw_url.strip()
    if url.startswith("postgres://"):
        db_url = "postgresql+psycopg://" + url[len("postgres://"):]
    elif url.startswith("postgresql://") and not url.startswith("postgresql+"):
        db_url = "postgresql+psycopg://" + url[len("postgresql://"):]
    else:
        db_url = url

    connect_args = {}
    engine_kwargs = {"echo": False}

    if db_url.startswith("sqlite"):
        connect_args["check_same_thread"] = False
    else:
        # PostgreSQL production settings (Neon serverless connection pool friendly)
        engine_kwargs.update({
            "pool_size": 10,
            "max_overflow": 20,
            "pool_pre_ping": True,  # Reconnect automatically when serverless DB suspends/restarts
            "pool_recycle": 300,    # Recycle idle connections every 5 minutes
        })

    eng = create_engine(
        db_url,
        connect_args=connect_args,
        **engine_kwargs,
    )
    return eng, db_url


engine, normalized_database_url = get_engine_and_url(settings.DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base class for all ORM models."""
    pass


def get_db():
    """FastAPI dependency — yields a DB session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

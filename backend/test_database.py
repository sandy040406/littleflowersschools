r"""
L3 Database & PostgreSQL compatibility tests.
Tests URL normalization, connection pool settings, and PostgreSQL DDL compilation for all models.

Usage:
  .\venv\Scripts\python.exe test_database.py
"""

import os
import sys

# Ensure backend root is on Python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from sqlalchemy.dialects import postgresql, sqlite
from sqlalchemy.schema import CreateTable

from app.core.database import Base, get_engine_and_url
from app.models.user import User
from app.models.student import Student
from app.models.gallery import Event, Media
from app.models.content import Announcement, HeroSlide, SiteSetting
from app.models.enquiry import Enquiry
from app.models.notice import Notice

failures = 0


def check(name: str, cond: bool, extra: str = ""):
    global failures
    status = "PASS: " if cond else "FAIL: "
    print(status + name + (f" -> {extra}" if not cond else ""))
    if not cond:
        failures += 1


print("=" * 60)
print("RUNNING L3 DATABASE & POSTGRESQL TEST SUITE")
print("=" * 60)

# --- 1. Connection URL Normalization ---
_, url1 = get_engine_and_url("sqlite:///./app.db")
check("SQLite URL preserved", url1 == "sqlite:///./app.db", url1)

neon_url = "postgres://usr:pwd@ep-xyz.neon.tech/neondb?sslmode=require"
_, url2 = get_engine_and_url(neon_url)
check(
    "postgres:// converted to postgresql+psycopg://",
    url2.startswith("postgresql+psycopg://"),
    url2,
)

standard_pg = "postgresql://usr:pwd@localhost:5432/littleflowers"
_, url3 = get_engine_and_url(standard_pg)
check(
    "postgresql:// converted to postgresql+psycopg://",
    url3.startswith("postgresql+psycopg://"),
    url3,
)

# --- 2. Connection Pool Configuration ---
eng_pg, _ = get_engine_and_url("postgresql+psycopg://usr:pwd@localhost:5432/db")
check("Postgres engine has pool_pre_ping enabled", eng_pg.pool._pre_ping is True)
check("Postgres engine pool_recycle set to 300", eng_pg.pool._recycle == 300)

eng_sq, _ = get_engine_and_url("sqlite:///:memory:")
conn = eng_sq.connect()
check("SQLite engine connects successfully with check_same_thread=False", conn is not None)
conn.close()

# --- 3. DDL Compilation against PostgreSQL Dialect ---
pg_dialect = postgresql.dialect()
all_models = [User, Student, Event, Media, Announcement, HeroSlide, SiteSetting, Enquiry, Notice]

for model in all_models:
    try:
        ddl = str(CreateTable(model.__table__).compile(dialect=pg_dialect))
        check(f"PostgreSQL DDL compilation for {model.__name__} ({model.__tablename__})", len(ddl) > 0)
    except Exception as e:
        check(f"PostgreSQL DDL compilation for {model.__name__}", False, str(e))

print("=" * 60)
if failures == 0:
    print("ALL L3 DATABASE TESTS PASSED!")
    sys.exit(0)
else:
    print(f"FAILED: {failures} test(s) failed.")
    sys.exit(1)

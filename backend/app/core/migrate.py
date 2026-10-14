"""
Lightweight schema sync for development.

`Base.metadata.create_all` creates missing tables but never adds new
columns to existing ones. Until Alembic is introduced (Phase 2), this
adds any missing *nullable / defaulted* columns so the local database
keeps working without being wiped.
"""

from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine

from app.core.database import Base


def _default_sql(column) -> str:
    default = column.default
    if default is None or not getattr(default, "is_scalar", False):
        return ""
    value = default.arg
    if isinstance(value, bool):
        return f" DEFAULT {1 if value else 0}"
    if isinstance(value, (int, float)):
        return f" DEFAULT {value}"
    return " DEFAULT '{}'".format(str(value).replace("'", "''"))


def sync_missing_columns(engine: Engine) -> list[str]:
    """Add columns defined on models but missing from the DB. Returns what was added."""
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())
    added: list[str] = []

    with engine.begin() as conn:
        for table in Base.metadata.sorted_tables:
            if table.name not in existing_tables:
                continue
            existing_cols = {c["name"] for c in inspector.get_columns(table.name)}
            for column in table.columns:
                if column.name in existing_cols:
                    continue
                col_type = column.type.compile(dialect=engine.dialect)
                default = _default_sql(column)
                # NOT NULL is only safe when a default exists
                not_null = " NOT NULL" if (not column.nullable and default) else ""
                conn.execute(text(
                    f'ALTER TABLE "{table.name}" ADD COLUMN "{column.name}" {col_type}{default}{not_null}'
                ))
                added.append(f"{table.name}.{column.name}")
    return added

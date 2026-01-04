"""
Database connection and session management.
"""

from contextlib import contextmanager
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from trend_finder.config import get_settings


def _create_engine():
    """Create database engine with settings."""
    settings = get_settings()
    return create_engine(
        settings.database_url,
        echo=False,  # Set True for SQL logs
        pool_pre_ping=True,
    )


# Lazy initialization
_engine = None
_SessionLocal = None


def get_engine():
    """Get or create the database engine."""
    global _engine
    if _engine is None:
        _engine = _create_engine()
    return _engine


def get_session_factory():
    """Get or create the session factory."""
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(
            bind=get_engine(),
            autoflush=False,
            autocommit=False,
        )
    return _SessionLocal


# For backwards compatibility
@property
def engine():
    return get_engine()


@property
def SessionLocal():
    return get_session_factory()


@contextmanager
def get_db() -> Generator[Session, None, None]:
    """
    Context manager for database sessions.

    Usage:
        with get_db() as db:
            db.query(...)
    """
    session_factory = get_session_factory()
    db = session_factory()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables."""
    from .models import Base

    Base.metadata.create_all(get_engine())

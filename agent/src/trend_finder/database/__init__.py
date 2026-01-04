"""Database module."""

from .connection import get_db, get_session_factory, get_engine, init_db
from .models import (
    Base,
    RequestDB,
    SearchCriteriaDB,
    ProductMetricsDB,
    ProductClustersDB,
)

# Backwards compatibility
SessionLocal = get_session_factory

__all__ = [
    "get_db",
    "get_session_factory",
    "get_engine",
    "init_db",
    "SessionLocal",
    "Base",
    "RequestDB",
    "SearchCriteriaDB",
    "ProductMetricsDB",
    "ProductClustersDB",
]

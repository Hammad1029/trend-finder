"""
Data schemas for the trend finder application.

All schemas are pure data classes with no business logic dependencies.
This ensures no circular imports.
"""

from .enums import Platforms, Currencies
from .products import ProductMetrics
from .search import SearchCriteria
from .clusters import ProductCluster
from .analytics import ClusterAnalyticsData, TrendAnalyticsData

__all__ = [
    "Platforms",
    "Currencies",
    "ProductMetrics",
    "SearchCriteria",
    "ProductCluster",
    "ClusterAnalyticsData",
    "TrendAnalyticsData",
]

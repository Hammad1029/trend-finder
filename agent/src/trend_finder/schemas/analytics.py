"""
Analytics data schemas.

These are PURE DATA classes with no business logic.
The computation logic lives in services/clustering/analytics.py
"""

from typing import Optional
from pydantic import BaseModel, Field


class TrendAnalyticsData(BaseModel):
    """Trend analysis results for a cluster."""

    final_score: int = 0
    label: str = "Unknown ❓"
    explanation: str = ""
    search_score: float = 0.0
    market_score: float = 0.0
    slope: float = 0.0
    volatility: float = 0.0
    sales_volume: int = 0
    saturation_ratio: float = 0.0


class ClusterAnalyticsData(BaseModel):
    """
    Analytics data for a product cluster.

    This is a PURE DATA class - no computation logic here.
    Use ClusterAnalyticsService to compute these values.
    """

    cluster_size: int = 0
    min_price: float = 0.0
    max_price: float = 0.0
    average_price: float = 0.0
    average_sales_last_month: int = 0
    average_rating: float = 0.0
    average_review_count: int = 0
    average_search_ranking: int = 0
    average_product_score: float = 0.0

    # Trend analytics (computed separately)
    trend_analytics: Optional[TrendAnalyticsData] = None

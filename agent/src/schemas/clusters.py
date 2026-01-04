"""
Product cluster schema.
"""

from typing import List, Optional
from pydantic import BaseModel, Field

from .products import ProductMetrics
from .analytics import ClusterAnalyticsData


class ProductCluster(BaseModel):
    """A cluster of similar products representing a market niche."""

    label: int = 0
    trend_keywords: List[str] = Field(default_factory=list)
    products: List[ProductMetrics] = Field(default_factory=list)

    # Analytics (computed after cluster creation)
    analytics: Optional[ClusterAnalyticsData] = None

"""
Product-related data schemas.
"""

from typing import List
from pydantic import BaseModel, Field

from .enums import Platforms, Currencies


class ProductMetrics(BaseModel):
    """Raw data scraped from a single product listing."""

    # Request info
    keyword_searched: str = ""

    # Product information
    platform: Platforms = Platforms.UNKNOWN
    unique_id: str = ""
    description: str = ""
    price: float = 0.0
    currency: Currencies = Currencies.UNKNOWN
    image_url: str = ""
    platform_category: str = ""
    platform_region: str = ""

    # Score calculation inputs
    rating: float = 0.0
    review_count: int = 0
    sales_last_month: int = 0
    search_ranking: int = 0
    sponsored: bool = False

    # Computed values
    score: float = 0.0
    embedding: List[float] = Field(default_factory=list)

    class Config:
        """Pydantic configuration."""

        use_enum_values = True

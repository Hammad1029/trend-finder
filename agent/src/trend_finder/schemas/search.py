"""
Search criteria schema.
"""

from typing import List
from pydantic import BaseModel, Field


class SearchCriteria(BaseModel):
    """Search parameters extracted from the user's request."""

    primary_keywords: List[str] = Field(
        default_factory=list,
        description="List of 3-5 specific search keywords optimized for shopping.",
    )
    negative_keywords: List[str] = Field(
        default_factory=list,
        description="Keywords to exclude from search to filter out irrelevant results.",
    )
    target_region: str = Field(
        default="us",
        description="The 2-letter ISO country code (e.g., 'us', 'fr').",
    )
    price_min: int = Field(
        default=0,
        description="Minimum price budget. 0 if not specified.",
    )
    price_max: int = Field(
        default=1000,
        description="Maximum price budget. 1000 if not specified.",
    )
    currency: str = Field(
        default="",
        description="The currency of the price range.",
    )
    vertical_category: str = Field(
        default="",
        description="The broad category of the product (e.g., 'Electronics', 'Fashion').",
    )
    time_horizon_in_months: int = Field(
        default=12,
        description="Trend timeframe in months.",
    )

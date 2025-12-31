from pydantic import BaseModel, Field
from typing import List, Literal, Optional

from agent.constants.enums import Currencies, Platforms


class SearchCriteria(BaseModel):
    """
    Search parameters extracted from the user's request.
    """

    primary_keywords: List[str] = Field(
        description="List of 3-5 specific search keywords optimized for shopping.",
        default=[],
    )
    negative_keywords: List[str] = Field(
        description="Keywords to exclude from search to filter out irrelevant results.",
        default=[],
    )
    target_region: str = Field(
        description="The 2-letter ISO country code (e.g., 'us', 'fr'). Default to 'us'.",
        default="us",
    )
    price_min: int = Field(
        description="Minimum price budget. 0 if not specified.", default=0
    )
    price_max: int = Field(
        description="Maximum price budget. 1000 if not specified.", default=1000
    )
    currency: str = Field(
        description="The currency of the price range.",
        default="",
    )
    vertical_category: str = Field(
        description="The broad category of the product (e.g., 'Electronics', 'Fashion').",
        default="",
    )
    time_horizon: str = Field(
        description="Trend timeframe. Defaults to 'past_12_months'.",
        default="past_12_months",
    )


class ProductMetrics(BaseModel):
    """Raw data scraped from a single listing."""

    # product information
    platform: Platforms = Platforms.UNKNOWN
    unique_id: str = ""
    description: str = ""
    price: float = 0
    currency: Currencies = Currencies.UNKNOWN
    image_url: str = ""
    platform_category: str = ""
    platform_region: str = ""

    # score calculation
    rating: float = 0
    review_count: int = 0
    sales_last_month: int = 0
    search_ranking: int = 0
    sponsored: bool = False
    score: int = 0


class ProductGroup(BaseModel):
    """A cluster of similar products representing a market niche."""

    group_id: str = ""  # Unique ID for the cluster
    group_name: str = ""  # Generated name e.g. "Bamboo Suction Plates"
    products: List[ProductMetrics] = []

    # Analysis Metrics (The "Jungle Scout" Logic)
    seller_density: int = 0  # Count of unique sellers in this group
    average_price: float = 0
    trend_trajectory: str = ""  # "Rising", "Stable", "Declining"
    opportunity_score: int = 0  # 1-10 Score

    # Sourcing Info
    wholesale_query: str = ""  # Optimization query for Alibaba
    target_cogs: float = 0  # Target buy price (e.g. 30% of avg price)


class GraphState(BaseModel):
    # 1. Input
    user_request: str = ""  # The raw "I want to sell..." text

    # 2. Planning Phase
    search_criteria: SearchCriteria = SearchCriteria()

    # 3. Execution Phase
    scraped_products: List[ProductMetrics] = []  # Flat list of raw results

    # 4. Analysis Phase
    grouped_trends: List[ProductGroup] = []  # Final output structure

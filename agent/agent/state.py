from pydantic import BaseModel, Field
from typing import List, Literal, Optional

from agent.constants.enums import Currencies, Platforms
from agent.utils.cluster_analytics import ClusterAnalytics


class SearchCriteriaState(BaseModel):
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
    time_horizon_in_months: int = Field(
        description="Trend timeframe in months. Defaults to 12.",
        default=12,
    )


class ProductMetricsState(BaseModel):
    """Raw data scraped from a single listing."""

    # request info
    keyword_searched: str = ""

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

    # embedding
    embedding: List[float] = []


class ProductClustersState(BaseModel):
    """A cluster of similar products representing a market niche."""

    label: int = 0
    trend_keywords: List[str] = []
    products: List[ProductMetricsState] = []

    # Analysis Metrics
    analytics: ClusterAnalytics = ClusterAnalytics([])


class GraphState(BaseModel):
    # 1. Input
    request_id: int = 0
    user_request: str = ""  # The raw "I want to sell..." text

    # 2. Planning Phase
    search_criteria_id: int = 0
    search_criteria: SearchCriteriaState = SearchCriteriaState()

    # 3. Execution Phase
    scraped_products_id: List[int] = []
    scraped_products: List[ProductMetricsState] = []  # Flat list of raw results

    # 4. Analysis Phase
    cluster_ids: List[int] = []
    clusters: List[ProductClustersState] = []  # Final output structure

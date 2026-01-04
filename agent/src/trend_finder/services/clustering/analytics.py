"""
Cluster analytics service.

Computes statistical metrics for product clusters.
"""

from statistics import mean
from typing import Protocol, Any, Sequence

from trend_finder.schemas import ClusterAnalyticsData, TrendAnalyticsData
from trend_finder.services.scoring import TrendScorer


class ProductLike(Protocol):
    """Protocol for product-like objects."""

    price: float
    sales_last_month: int
    rating: float
    review_count: int
    search_ranking: int
    score: float


class ClusterAnalyticsService:
    """
    Service for computing cluster analytics.

    This service computes aggregate statistics for product clusters
    and integrates with the TrendScorer for trend analysis.
    """

    def __init__(self, trend_scorer: TrendScorer | None = None):
        self.trend_scorer = trend_scorer or TrendScorer()

    def compute_analytics(
        self,
        products: Sequence[ProductLike],
        trends_response: Any = None,
    ) -> ClusterAnalyticsData:
        """
        Compute analytics for a cluster of products.

        Args:
            products: List of products in the cluster
            trends_response: Optional response from DataForSEO trends API

        Returns:
            ClusterAnalyticsData with computed metrics
        """
        if not products:
            return ClusterAnalyticsData()

        # Extract values, filtering None
        prices = [p.price for p in products if p.price is not None]
        sales = [p.sales_last_month for p in products if p.sales_last_month is not None]
        ratings = [p.rating for p in products if p.rating is not None]
        reviews = [p.review_count for p in products if p.review_count is not None]
        rankings = [p.search_ranking for p in products if p.search_ranking is not None]
        scores = [p.score for p in products if p.score is not None]

        # Compute averages
        avg_sales = int(round(mean(sales))) if sales else 0
        avg_reviews = int(round(mean(reviews))) if reviews else 0

        # Compute trend analytics if we have trend data
        trend_analytics = None
        if trends_response:
            trend_analytics = self.trend_scorer.analyze(
                trends_response=trends_response,
                average_sales=avg_sales,
                average_reviews=avg_reviews,
            )

        return ClusterAnalyticsData(
            cluster_size=len(products),
            min_price=min(prices) if prices else 0.0,
            max_price=max(prices) if prices else 0.0,
            average_price=round(mean(prices), 2) if prices else 0.0,
            average_sales_last_month=avg_sales,
            average_rating=round(mean(ratings), 2) if ratings else 0.0,
            average_review_count=avg_reviews,
            average_search_ranking=int(round(mean(rankings))) if rankings else 0,
            average_product_score=round(mean(scores), 2) if scores else 0.0,
            trend_analytics=trend_analytics,
        )

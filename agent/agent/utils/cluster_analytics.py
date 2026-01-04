from agent.state import ProductMetricsState
from agent.utils.scorer import TrendScorer
from db.models import ProductMetricsDB
from typing import List
from pydantic import BaseModel, Field
from statistics import mean


class ClusterAnalytics(BaseModel):
    cluster_size: int = 0
    min_price: float = 0
    max_price: float = 0
    average_price: float = 0
    average_sales_last_month: int = 0
    average_rating: float = 0
    average_review_count: int = 0
    average_search_ranking: int = 0
    average_product_score: float = 0

    trend_analytics: TrendScorer

    def __init__(self, cluster_products: List[ProductMetricsState]):
        super().__init__(
            cluster_size=0,
            min_price=0,
            max_price=0,
            average_price=0,
            average_sales_last_month=0,
            average_rating=0,
            average_review_count=0,
            average_search_ranking=0,
            average_product_score=0,
            trend_score=[],
            average_trend_score=0,
        )

        if not cluster_products or len(cluster_products) == 0:
            return
        else:
            prices = [p.price for p in cluster_products if p.price is not None]
            sales = [
                p.sales_last_month
                for p in cluster_products
                if p.sales_last_month is not None
            ]
            ratings = [p.rating for p in cluster_products if p.rating is not None]
            reviews = [
                p.review_count for p in cluster_products if p.review_count is not None
            ]
            rankings = [
                p.search_ranking
                for p in cluster_products
                if p.search_ranking is not None
            ]
            scores = [p.score for p in cluster_products if p.score is not None]

            self.cluster_size = len(cluster_products)
            self.min_price = min(prices) if prices else 0
            self.max_price = max(prices) if prices else 0
            self.average_price = mean(prices) if prices else 0.0

            self.average_sales_last_month = int(round(mean(sales) if sales else 0.0, 2))
            self.average_rating = round(mean(ratings) if ratings else 0.0, 2)
            self.average_review_count = int(round(mean(reviews) if reviews else 0.0, 2))
            self.average_search_ranking = int(
                round(mean(rankings) if rankings else 0.0, 2)
            )
            self.average_product_score = round(mean(scores) if scores else 0.0, 2)

"""
Product scoring service.

Calculates a composite score for products based on demand, velocity, and friction.
"""

import math
from typing import Protocol

from trend_finder.config.constants import PRODUCT_SCORER_CONFIG, ProductScorerConfig


class ProductLike(Protocol):
    """Protocol for objects that can be scored."""

    sales_last_month: int
    review_count: int
    search_ranking: int
    sponsored: bool
    description: str


class ProductScorer:
    """Service for calculating product scores."""

    def __init__(self, config: ProductScorerConfig = PRODUCT_SCORER_CONFIG):
        self.config = config

    def calculate_score(self, product: ProductLike) -> int:
        """
        Calculate a composite score for a product.

        The score is based on:
        - Demand: How many sales the product has
        - Velocity: Sales relative to reviews (newness indicator)
        - Friction: Search ranking and listing quality

        Args:
            product: Product-like object with required attributes

        Returns:
            Integer score from 0-100
        """
        demand = self._calculate_demand(product)
        velocity = self._calculate_velocity(product)
        friction = self._calculate_friction(product)

        return math.floor(demand + velocity + friction)

    def _calculate_demand(self, product: ProductLike) -> float:
        """Calculate demand component based on sales volume."""
        sales = max(1, product.sales_last_month)
        normalized = math.log10(sales) / self.config.DEMAND_MAX_LOG
        return self._weigh_score(normalized, self.config.DEMAND_WEIGHT)

    def _calculate_velocity(self, product: ProductLike) -> float:
        """Calculate velocity component (sales relative to reviews)."""
        velocity_ratio = (
            product.sales_last_month
            / (product.review_count + self.config.REVIEW_SMOOTHER)
        ) * self.config.VELOCITY_SCALER
        return self._weigh_score(velocity_ratio, self.config.VELOCITY_WEIGHT)

    def _calculate_friction(self, product: ProductLike) -> float:
        """Calculate friction component based on ranking and quality."""
        # Rank penalty
        friction_rank = min(
            self.config.FRICTION_WEIGHT / 2,
            product.search_ranking / self.config.FRICTION_RANK_DIVIDER,
        )

        # Quality bonuses
        friction_flaws = 0
        if not product.sponsored:
            friction_flaws += self.config.FRICTION_FLAW_SPONSORED
        if len(product.description) < 100:
            friction_flaws += self.config.FRICTION_FLAG_DESCRIPTION

        return self._weigh_score(
            friction_rank + friction_flaws, self.config.FRICTION_WEIGHT
        )

    def _weigh_score(self, score: float, weight: int) -> float:
        """Apply weight to a score component."""
        return min(weight, weight * score)


# Default instance for convenience
_default_scorer = ProductScorer()


def calculate_product_score(product: ProductLike) -> int:
    """
    Calculate product score using the default scorer.

    This is a convenience function for simple use cases.
    For custom configuration, instantiate ProductScorer directly.
    """
    return _default_scorer.calculate_score(product)

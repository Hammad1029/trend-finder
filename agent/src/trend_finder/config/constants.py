"""
Application constants and configuration values.

These are static configuration values that don't change at runtime.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class ProductScorerConfig:
    """Configuration for product scoring algorithm."""

    DEMAND_WEIGHT: int = 40
    VELOCITY_WEIGHT: int = 30
    FRICTION_WEIGHT: int = 30

    DEMAND_MAX_LOG: int = 5
    REVIEW_SMOOTHER: int = 50
    VELOCITY_SCALER: int = 2
    FRICTION_RANK_DIVIDER: int = 4
    FRICTION_FLAW_SPONSORED: int = 10
    FRICTION_FLAG_DESCRIPTION: int = 5


@dataclass(frozen=True)
class TrendScorerConfig:
    """Configuration for trend scoring algorithm."""

    W_SEARCH: float = 0.60
    W_MARKET: float = 0.40

    SATURATION_LIMIT: int = 500
    MIN_SALES_PROOF: int = 50
    VIRALITY_THRESHOLD: float = 20.0


@dataclass(frozen=True)
class ClustererConfig:
    """Configuration for DBSCAN clustering."""

    DBSCAN_EPS: float = 0.3
    DBSCAN_MIN_SAMPLES: int = 2
    DBSCAN_METRIC: str = "cosine"

    TRENDS_TIME_RANGE: str = "today 12-m"
    CLUSTER_KEYWORDS_LIMIT: int = 5


# Default instances
PRODUCT_SCORER_CONFIG = ProductScorerConfig()
TREND_SCORER_CONFIG = TrendScorerConfig()
CLUSTERER_CONFIG = ClustererConfig()

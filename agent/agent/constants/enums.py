from enum import Enum


class Platforms(Enum):
    AMAZON = "amazon"
    UNKNOWN = "unknown"


class Currencies(Enum):
    USD = "USD"
    UNKNOWN = "unknown"


class ProductScorerConstants(Enum):
    DEMAND_WEIGHT = 40
    VELOCITY_WEIGHT = 30
    FRICTION_WEIGHT = 30

    DEMAND_MAX_LOG = 5
    REVIEW_SMOOTHER = 50
    VELOCITY_SCALER = 2
    FRICTION_RANK_DIVIDER = 4
    FRICTION_FLAW_SPONSORED = 10
    FRICTION_FLAG_DESCRIPTION = 5


class TrendScorerConstants(Enum):
    W_SEARCH = 0.60
    W_MARKET = 0.40

    SATURATION_LIMIT = 500
    MIN_SALES_PROOF = 50
    VIRALITY_THRESHOLD = 20.0


class ClustererConstants(Enum):
    DBSCAN_EPS = 0.3
    DBSCAN_MIN_SAMPLES = 2
    DBSCAN_METRIC = "cosine"

    TRENDS_TIME_RANGE = "today 12-m"  # "now 1-H", "now 4-H", "now 1-d", "now 7-d", "today 1-m", "today 3-m", "today 12-m", "today 5-y", "all"
    CLUSTER_KEYWORDS_LIMIT = 5

from enum import Enum


class Platforms(Enum):
    AMAZON = "amazon"
    UNKNOWN = "unknown"


class Currencies(Enum):
    USD = "USD"
    UNKNOWN = "unknown"


class ScoreConstants(Enum):
    DEMAND_WEIGHT = 40
    VELOCITY_WEIGHT = 30
    FRICTION_WEIGHT = 30

    DEMAND_MAX_LOG = 5
    REVIEW_SMOOTHER = 50
    VELOCITY_SCALER = 2
    FRICTION_RANK_DIVIDER = 4
    FRICTION_FLAW_SPONSORED = 10
    FRICTION_FLAG_DESCRIPTION = 5

import math
from agent.constants.enums import ScoreConstants
from agent.state import ProductMetrics


def calculate_product_score(product: ProductMetrics) -> int:
    demand = weigh_score(
        math.log10(product.sales_last_month if product.sales_last_month > 0 else 1)
        / ScoreConstants.DEMAND_MAX_LOG.value,
        ScoreConstants.DEMAND_WEIGHT.value,
    )

    velocity = weigh_score(
        (
            (
                product.sales_last_month
                / (product.review_count + ScoreConstants.REVIEW_SMOOTHER.value)
            )
            * ScoreConstants.VELOCITY_SCALER.value
        ),
        ScoreConstants.VELOCITY_WEIGHT.value,
    )

    friction_rank = min(
        ScoreConstants.FRICTION_WEIGHT.value / 2,
        product.search_ranking / ScoreConstants.FRICTION_RANK_DIVIDER.value,
    )
    friction_flaws = (
        ScoreConstants.FRICTION_FLAW_SPONSORED.value if not product.sponsored else 0
    ) + (
        ScoreConstants.FRICTION_FLAG_DESCRIPTION.value
        if len(product.description) < 100
        else 0
    )
    friction = weigh_score(
        friction_rank + friction_flaws, ScoreConstants.FRICTION_WEIGHT.value
    )

    score = demand + velocity + friction
    return math.floor(score)


def weigh_score(score: float, weight: int) -> int:
    return math.floor(min(weight, weight * score))

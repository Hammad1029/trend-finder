from agent.constants.enums import TrendScorerConstants
import math
from typing import List
from agent.constants.enums import ProductScorerConstants
from agent.state import ProductClustersState, ProductMetricsState
import numpy as np
from scipy.stats import linregress
from typing import Dict, Any, List, cast, Optional, Sequence
from dataclasses import dataclass
import matplotlib.pyplot as plt


class ProductScorer:
    def __init__(self):
        pass

    def calculate_product_score(self, product: ProductMetricsState) -> int:
        demand = self.weigh_score(
            math.log10(product.sales_last_month if product.sales_last_month > 0 else 1)
            / ProductScorerConstants.DEMAND_MAX_LOG.value,
            ProductScorerConstants.DEMAND_WEIGHT.value,
        )

        velocity = self.weigh_score(
            (
                (
                    product.sales_last_month
                    / (
                        product.review_count
                        + ProductScorerConstants.REVIEW_SMOOTHER.value
                    )
                )
                * ProductScorerConstants.VELOCITY_SCALER.value
            ),
            ProductScorerConstants.VELOCITY_WEIGHT.value,
        )

        friction_rank = min(
            ProductScorerConstants.FRICTION_WEIGHT.value / 2,
            product.search_ranking / ProductScorerConstants.FRICTION_RANK_DIVIDER.value,
        )
        friction_flaws = (
            ProductScorerConstants.FRICTION_FLAW_SPONSORED.value
            if not product.sponsored
            else 0
        ) + (
            ProductScorerConstants.FRICTION_FLAG_DESCRIPTION.value
            if len(product.description) < 100
            else 0
        )
        friction = self.weigh_score(
            friction_rank + friction_flaws, ProductScorerConstants.FRICTION_WEIGHT.value
        )

        score = demand + velocity + friction
        return math.floor(score)

    def weigh_score(self, score: float, weight: int) -> int:
        return math.floor(min(weight, weight * score))


class TrendScorer:
    final_score: int
    label: str
    explanation: str
    search_score: float
    market_score: float
    slope: float
    volatility: float
    sales_volume: int
    saturation_ratio: float

    def __init__(
        self,
        cluster_obj: ProductClustersState,
        trends_res,
    ):
        """
        Main entry point.
        :param cluster_obj: Instance of ProductClustersState (or dict with same keys)
        :param seo_json: The list returned by DataForSEO API
        """

        # 1. Calculate the "Desire" (Search Score)
        items = None
        if trends_res and trends_res.tasks and len(trends_res.tasks) > 0:
            task = trends_res.tasks[0]
            if task and task.result and len(task.result) > 0 and task.result[0]:
                items = task.result[0].items

        search_metrics = self.calculate_search_metrics(items)
        search_score = self.compute_search_score(search_metrics)

        # 2. Calculate the "Reality" (Market Score)
        # Handle cases where DB values might be None
        sales = cluster_obj.analytics.average_sales_last_month or 0
        reviews = cluster_obj.analytics.average_review_count or 0

        market_score = self.compute_market_score(sales, reviews)

        # 3. Calculate Final Composite Score
        final_score = int(
            (search_score * TrendScorerConstants.W_SEARCH.value)
            + (market_score * TrendScorerConstants.W_MARKET.value)
        )

        # 4. Determine Label & Explanation
        label, explanation = self.classify_trend(
            slope=search_metrics["slope"],
            volatility=search_metrics["volatility"],
            sales=sales,
            reviews=reviews,
            search_score=search_score,
        )

        self.final_score = final_score
        self.label = label
        self.explanation = explanation
        self.search_score = round(search_score, 2)
        self.market_score = round(market_score, 2)
        self.slope = round(search_metrics["slope"], 2)
        self.volatility = round(search_metrics["volatility"], 2)
        self.sales_volume = sales
        self.saturation_ratio = round(
            min(1.0, reviews / TrendScorerConstants.SATURATION_LIMIT.value), 2
        )

    # --- INTERNAL LOGIC ---

    def calculate_search_metrics(
        self,
        search_points,
    ) -> Dict[str, float]:
        """Parses DataForSEO JSON to find Slope and Volatility."""
        default = {"slope": 0.0, "volatility": 0.0, "recent_strength": 0.0}

        if not search_points or not search_points[0] or not search_points[0].data:
            return default

        # 1. Sum keywords per week to get "Topic Volume"
        points = search_points[0].data

        y_values = [
            sum(v for v in p.values if v is not None) if (p and p.values) else 0
            for p in points
        ]

        if not y_values or sum(y_values) == 0:
            return default

        # 2. Normalize (0-100 Scale)
        # This allows us to compare "Niche" vs "Mass" trends fairly
        max_val = max(y_values)
        norm_y = [(y / max_val) * 100 for y in y_values]
        x_values = range(len(norm_y))

        # 3. Calculate Velocity (Slope)
        slope = 0
        if len(norm_y) > 1:
            res: Any = linregress(x_values, norm_y)
            print(
                f"Slope: {res.slope}, Intercept: {res.intercept}, R: {res.rvalue}, P: {res.pvalue}, SE: {res.stderr}"
            )
            slope = res.slope

        # 4. Calculate Volatility (Standard Deviation)
        volatility = np.std(norm_y)

        # 5. Plot graph
        self.plot_and_save_graph(list(x_values), norm_y)

        return {
            "slope": float(slope),
            "volatility": float(volatility),
            "recent_strength": float(norm_y[-1]),  # The latest data point strength
        }

    def compute_search_score(self, metrics: Dict[str, float]) -> float:
        """
        Applies the 'Viral Reward' logic.
        If growing: Volatility adds points (Hype).
        If shrinking: Volatility subtracts points (Crash).
        """
        base_score = metrics["recent_strength"]
        slope = metrics["slope"]
        volatility = metrics["volatility"]

        if slope > 0:
            # Reward: Growth + Hype
            # Slope * 10 means a slope of 5 adds 50 points (capped at 100 total)
            bonus = (slope * 10) + (volatility * 0.5)
            score = base_score + bonus
        else:
            # Penalty: Crash - Hype
            penalty = (abs(slope) * 10) + (volatility * 0.5)
            score = base_score - penalty

        return max(0.0, min(100.0, score))

    def compute_market_score(self, sales: int, reviews: int) -> float:
        """
        Calculates opportunity based on Sales Volume vs. Competition.
        """
        if sales == 0:
            return 0.0

        # 1. Sales Score (Logarithmic)
        # log10(100) = 2, log10(1000) = 3.
        # We assume 1000 sales/mo is "Perfect" (Score 100)
        # Formula: (log10(Sales) / 3) * 100
        sales_score = (np.log10(sales + 1) / 3.0) * 100
        sales_score = min(100.0, sales_score)

        # 2. Saturation Penalty (The "Too Late" Check)
        # If reviews >= 500, penalty is max (1.0)
        saturation_ratio = min(
            1.0, reviews / TrendScorerConstants.SATURATION_LIMIT.value
        )

        # Apply Penalty
        # We discount the sales score by the saturation.
        # Even if sales are huge, if saturation is 100%, score drops significantly.
        final_market_score = sales_score * (1.0 - (saturation_ratio * 0.8))
        # * 0.8 means we leave 20% score even if saturated, because high volume is still worth *something*.

        return max(0.0, final_market_score)

    def classify_trend(
        self, slope, volatility, sales, reviews, search_score
    ) -> tuple[str, str]:
        """Returns (Label, Explanation) based on the Decision Matrix."""

        # Priority 1: Market Killers (Dead or Saturated)
        if sales < TrendScorerConstants.MIN_SALES_PROOF.value and search_score < 40:
            return "Dead 💀", "Low search volume and negligible sales."

        if reviews > TrendScorerConstants.SATURATION_LIMIT.value:
            return (
                "Saturated 🛑",
                f"High competition ({reviews} avg reviews). Hard to enter.",
            )

        # Priority 2: Downward Trends
        if slope < -2:
            return "Declining 📉", "Search interest is actively dropping."

        # Priority 3: Positive Trends
        if slope > 5 and volatility > TrendScorerConstants.VIRALITY_THRESHOLD.value:
            return "Viral 🚀", "Explosive growth with high social volatility."

        if slope > 3:
            return "Growth 🔥", "Steady, reliable upward trend."

        if (
            slope > -2
            and slope < 3
            and sales > TrendScorerConstants.MIN_SALES_PROOF.value
        ):
            return "Stable 🟢", "Flat search trend but proven consistent sales."

        if search_score > 70 and sales < TrendScorerConstants.MIN_SALES_PROOF.value:
            return (
                "Speculative 🎲",
                "High search interest but low Amazon supply. Opportunity?",
            )

        return "Unknown ❓", "Data inconclusive."

    def plot_and_save_graph(self, x: list[int], y: list[float]):
        (line,) = plt.plot(x, y, "o", markersize=3, label=f"Data")

        # Calculate linear regression
        res: Any = linregress(x, y)

        # Create the line of best fit: y = mx + c
        line_fit = res.intercept + res.slope * x

        # Plot the line of best fit using the same color as the data
        plt.plot(
            x,
            line_fit,
            color=line.get_color(),
            linestyle="--",
            label=f"Fit ($R^2={res.rvalue**2:.2f}$)",
        )
        plt.xlabel("x-axis")
        plt.ylabel("y-axis")
        plt.title("Comparison of Multiple Data Sets")
        plt.legend()
        plt.savefig("graph.png")

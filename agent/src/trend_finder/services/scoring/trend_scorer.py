"""
Trend scoring service.

Analyzes search trends and market data to score product clusters.
"""

from typing import Any, Dict, Optional, Tuple

import numpy as np
from scipy.stats import linregress

from trend_finder.schemas import TrendAnalyticsData, ClusterAnalyticsData
from trend_finder.config.constants import TREND_SCORER_CONFIG, TrendScorerConfig

import matplotlib.pyplot as plt


class TrendScorer:
    """
    Service for scoring trends based on search data and market metrics.

    This service analyzes:
    - Search trends (slope, volatility, recent strength)
    - Market metrics (sales volume, review saturation)

    And produces a composite score with classification.
    """

    def __init__(self, config: TrendScorerConfig = TREND_SCORER_CONFIG):
        self.config = config

    def analyze(
        self,
        trends_response: Any,
        average_sales: int,
        average_reviews: int,
    ) -> TrendAnalyticsData:
        """
        Analyze trends and produce analytics data.

        Args:
            trends_response: Response from DataForSEO trends API
            average_sales: Average monthly sales for the cluster
            average_reviews: Average review count for the cluster

        Returns:
            TrendAnalyticsData with scores and classification
        """
        # 1. Extract search metrics from API response
        items = self._extract_items(trends_response)
        search_metrics = self._calculate_search_metrics(items)
        search_score = self._compute_search_score(search_metrics)

        # 2. Calculate market score
        market_score = self._compute_market_score(average_sales, average_reviews)

        # 3. Calculate final composite score
        final_score = int(
            (search_score * self.config.W_SEARCH) + (market_score * self.config.W_MARKET)
        )

        # 4. Classify the trend
        label, explanation = self._classify_trend(
            slope=search_metrics["slope"],
            volatility=search_metrics["volatility"],
            sales=average_sales,
            reviews=average_reviews,
            search_score=search_score,
        )

        # 5. Calculate saturation ratio
        saturation_ratio = min(1.0, average_reviews / self.config.SATURATION_LIMIT)

        return TrendAnalyticsData(
            final_score=final_score,
            label=label,
            explanation=explanation,
            search_score=round(search_score, 2),
            market_score=round(market_score, 2),
            slope=round(search_metrics["slope"], 2),
            volatility=round(search_metrics["volatility"], 2),
            sales_volume=average_sales,
            saturation_ratio=round(saturation_ratio, 2),
        )

    def _extract_items(self, trends_response: Any) -> Optional[Any]:
        """Extract items from the trends API response."""
        if not trends_response:
            return None

        if not hasattr(trends_response, "tasks") or not trends_response.tasks:
            return None

        task = trends_response.tasks[0]
        if not task or not hasattr(task, "result") or not task.result:
            return None

        if not task.result[0]:
            return None

        return getattr(task.result[0], "items", None)

    def _calculate_search_metrics(self, search_points: Any) -> Dict[str, float]:
        """Parse search data to calculate slope and volatility."""
        default = {"slope": 0.0, "volatility": 0.0, "recent_strength": 0.0}

        if not search_points:
            return default

        if not search_points[0] or not hasattr(search_points[0], "data"):
            return default

        points = search_points[0].data
        if not points:
            return default

        # Sum values per time point
        y_values = []
        for p in points:
            if p and hasattr(p, "values") and p.values:
                y_values.append(sum(v for v in p.values if v is not None))
            else:
                y_values.append(0)

        if not y_values or sum(y_values) == 0:
            return default

        # Normalize to 0-100 scale
        max_val = max(y_values)
        norm_y = [(y / max_val) * 100 for y in y_values]
        x_values = list(range(len(norm_y)))

        # Calculate slope via linear regression
        slope = 0.0
        if len(norm_y) > 1:
            res: Any = linregress(x_values, norm_y)
            slope = float(res.slope)

        # Calculate volatility (standard deviation)
        volatility = float(np.std(norm_y))

        self.plot_and_save_graph(list(x_values), norm_y)

        return {
            "slope": slope,
            "volatility": volatility,
            "recent_strength": float(norm_y[-1]),
        }

    def _compute_search_score(self, metrics: Dict[str, float]) -> float:
        """
        Apply the 'Viral Reward' logic to compute search score.

        If growing: Volatility adds points (Hype).
        If shrinking: Volatility subtracts points (Crash).
        """
        base_score = metrics["recent_strength"]
        slope = metrics["slope"]
        volatility = metrics["volatility"]

        if slope > 0:
            # Reward: Growth + Hype
            bonus = (slope * 10) + (volatility * 0.5)
            score = base_score + bonus
        else:
            # Penalty: Crash - Hype
            penalty = (abs(slope) * 10) + (volatility * 0.5)
            score = base_score - penalty

        return max(0.0, min(100.0, score))

    def _compute_market_score(self, sales: int, reviews: int) -> float:
        """Calculate opportunity score based on sales vs competition."""
        if sales == 0:
            return 0.0

        # Sales score (logarithmic, 1000 sales = perfect 100)
        sales_score = (np.log10(sales + 1) / 3.0) * 100
        sales_score = min(100.0, sales_score)

        # Saturation penalty
        saturation_ratio = min(1.0, reviews / self.config.SATURATION_LIMIT)

        # Apply penalty (leave 20% even if saturated)
        final_market_score = sales_score * (1.0 - (saturation_ratio * 0.8))

        return max(0.0, final_market_score)

    def _classify_trend(
        self,
        slope: float,
        volatility: float,
        sales: int,
        reviews: int,
        search_score: float,
    ) -> Tuple[str, str]:
        """Classify the trend and provide explanation."""

        # Priority 1: Market Killers
        if sales < self.config.MIN_SALES_PROOF and search_score < 40:
            return "Dead 💀", "Low search volume and negligible sales."

        if reviews > self.config.SATURATION_LIMIT:
            return (
                "Saturated 🛑",
                f"High competition ({reviews} avg reviews). Hard to enter.",
            )

        # Priority 2: Downward Trends
        if slope < -2:
            return "Declining 📉", "Search interest is actively dropping."

        # Priority 3: Positive Trends
        if slope > 5 and volatility > self.config.VIRALITY_THRESHOLD:
            return "Viral 🚀", "Explosive growth with high social volatility."

        if slope > 3:
            return "Growth 🔥", "Steady, reliable upward trend."

        if -2 <= slope < 3 and sales > self.config.MIN_SALES_PROOF:
            return "Stable 🟢", "Flat search trend but proven consistent sales."

        if search_score > 70 and sales < self.config.MIN_SALES_PROOF:
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
        x_arr = np.array(x)
        line_fit = res.intercept + res.slope * x_arr

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

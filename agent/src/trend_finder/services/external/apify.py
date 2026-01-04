"""
Apify service for web scraping via Apify actors.
"""

from typing import List

from apify_client import ApifyClient

from trend_finder.config import get_settings
from trend_finder.schemas import ProductMetrics, SearchCriteria, Platforms, Currencies


class ApifyService:
    """Service for interacting with Apify actors."""

    def __init__(self, token: str | None = None):
        settings = get_settings()
        self.client = ApifyClient(token or settings.apify_token)
        self._is_dev = settings.env == "development"

    def run_amazon_scraper(self, criteria: SearchCriteria) -> List[ProductMetrics]:
        """
        Run Amazon product scraper for given search criteria.

        Args:
            criteria: Search criteria with keywords and region

        Returns:
            List of normalized ProductMetrics
        """
        products: List[ProductMetrics] = []

        for keyword in criteria.primary_keywords:
            run_input = {
                "input": [
                    {
                        "keyword": keyword,
                        "domainCode": (
                            "com"
                            if criteria.target_region == "us"
                            else criteria.target_region
                        ),
                        "sortBy": "relevanceblender",
                        "maxPages": 1,
                    }
                ]
            }

            run = self.client.actor("9GmEDf8sr9Jyb6b3X").call(run_input=run_input)

            if run is not None:
                iterator = self.client.dataset(run["defaultDatasetId"]).iterate_items()
                products.extend(
                    self._normalize_products(
                        list(iterator),
                        criteria.target_region,
                        keyword,
                    )
                )

            # In development, only process first keyword
            if self._is_dev:
                break

        return products

    def _normalize_products(
        self,
        scraped_products: List[dict],
        region: str,
        keyword: str,
    ) -> List[ProductMetrics]:
        """Normalize raw scraped data to ProductMetrics."""
        if not scraped_products:
            return []

        if scraped_products[0].get("statusCode") != 200:
            return []

        normalized = []

        for product in scraped_products:
            # Parse rating
            rating_str = product.get("productRating", "0") or "0"
            rating = float(rating_str.split(" ")[0].replace(",", "."))

            # Parse sales volume
            raw_volume = (product.get("salesVolume", "0") or "0").split("+")[0]
            raw_volume_numeric = raw_volume.replace("K", "")
            if raw_volume_numeric.isdigit():
                volume_multiplier = 1000 if "K" in raw_volume else 1
                sales_last_month = int(raw_volume_numeric) * volume_multiplier
            else:
                sales_last_month = 0

            normalized.append(
                ProductMetrics(
                    keyword_searched=keyword,
                    platform=Platforms.AMAZON,
                    unique_id=product.get("asin", ""),
                    description=product.get("productDescription", "") or "",
                    price=product.get("price", 0) or 0,
                    currency=Currencies.USD if region == "us" else Currencies.UNKNOWN,
                    image_url=product.get("imgUrl", "") or "",
                    platform_category=product.get("selectedCategory", "") or "",
                    platform_region=region,
                    rating=rating,
                    review_count=product.get("countReview", 0) or 0,
                    search_ranking=product.get("searchResultPosition", 0) or 0,
                    sales_last_month=sales_last_month,
                    sponsored=(
                        product.get("sponsored", False) or product.get("prime", False)
                    ),
                )
            )

        return normalized


# Convenience function
def run_amazon_actor(criteria: SearchCriteria) -> List[ProductMetrics]:
    """Run Amazon scraper using default service."""
    service = ApifyService()
    return service.run_amazon_scraper(criteria)

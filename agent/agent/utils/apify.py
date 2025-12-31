from agent.constants.enums import Currencies, Platforms
from agent.state import ProductMetrics
from apify_client import ApifyClient
import os

from agent.state import SearchCriteria

client = ApifyClient(os.getenv("APIFY_TOKEN"))


def run_amazon_actor(criteria: SearchCriteria) -> list[ProductMetrics]:
    products = []

    for keyword in criteria.primary_keywords:
        # Prepare the Actor input
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
                    # "category": criteria.vertical_category,
                }
            ]
        }

        run = client.actor("9GmEDf8sr9Jyb6b3X").call(run_input=run_input)
        if run is not None:
            iterator = client.dataset(run["defaultDatasetId"]).iterate_items()
            products.extend(normalize_products(list(iterator), criteria.target_region))

        if os.environ.get("ENV") == "development":
            break

    return products


def normalize_products(
    scraped_products: list[dict], region: str
) -> list[ProductMetrics]:
    if scraped_products[0].get("statusCode") != 200:
        return []

    normalized = []

    for product in scraped_products:
        platform = Platforms.AMAZON
        unique_id = product.get("asin", "")
        description = product.get("productDescription", "") or ""
        price = product.get("price", 0) or 0
        currency = Currencies.USD if region == "USA" else Currencies.UNKNOWN
        image_url = product.get("imgUrl", "") or ""
        platform_category = product.get("selectedCategory", "") or ""
        platform_region = region

        rating = float(
            (product.get("productRating", "0") or "0").split(" ")[0].replace(",", ".")
        )
        review_count = product.get("countReview", 0) or 0
        search_ranking = product.get("searchResultPosition", 0) or 0

        raw_volume = (product.get("salesVolume", "0") or "0").split("+")[0]
        raw_volume_numeric = raw_volume.replace("K", "")
        if raw_volume_numeric.isdigit():
            volume_multiplier = 1000 if "K" in raw_volume else 1
            sales_last_month = int(raw_volume_numeric) * volume_multiplier
        else:
            sales_last_month = 0
        sponsored = (product.get("sponsored", False)) or (product.get("prime", False))

        normalized_product = ProductMetrics(
            platform=platform,
            unique_id=unique_id,
            description=description,
            price=price,
            currency=currency,
            image_url=image_url,
            platform_category=platform_category,
            platform_region=platform_region,
            rating=rating,
            review_count=review_count,
            search_ranking=search_ranking,
            sales_last_month=sales_last_month,
            sponsored=sponsored,
        )
        normalized.append(normalized_product)

    return normalized

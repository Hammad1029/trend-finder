"""
Scraper node - scrapes products from e-commerce platforms.
"""

from core.state import GraphState
from schemas import ProductMetrics
from services.external import ApifyService
from services.scoring import calculate_product_score
from llm import get_embeddings_model
from database import get_db, ProductMetricsDB


def scraper_node(state: GraphState) -> GraphState:
    """
    Scrape products from Amazon based on search criteria.

    This node:
    1. Scrapes products using Apify
    2. Calculates product scores
    3. Generates embeddings
    4. Saves to database
    """
    print("--- STEP 2: SCRAPING PRODUCTS ---")

    # Scrape products
    apify = ApifyService()
    products = apify.run_amazon_scraper(state.search_criteria)

    # Generate embeddings
    embeddings_model = get_embeddings_model()
    descriptions = [p.description for p in products]
    vectors = embeddings_model.embed_documents(descriptions)

    # Calculate scores and assign embeddings
    for idx, product in enumerate(products):
        product.score = calculate_product_score(product)
        product.embedding = vectors[idx]

    state.scraped_products = products

    # Save to database
    with get_db() as session:
        db_products = [
            ProductMetricsDB(
                keyword_searched=p.keyword_searched,
                platform=(p.platform.value if hasattr(p.platform, "value") else p.platform),
                unique_id=p.unique_id,
                description=p.description,
                price=p.price,
                currency=(p.currency.value if hasattr(p.currency, "value") else p.currency),
                image_url=p.image_url,
                platform_category=p.platform_category,
                platform_region=p.platform_region,
                rating=p.rating,
                review_count=p.review_count,
                sales_last_month=p.sales_last_month,
                search_ranking=p.search_ranking,
                sponsored=p.sponsored,
                score=p.score,
                request_id=state.request_id,
                embedding=p.embedding,
            )
            for p in products
        ]
        session.add_all(db_products)
        session.commit()

        for p in db_products:
            session.refresh(p)

        state.scraped_products_id = [p.id for p in db_products]

    return state

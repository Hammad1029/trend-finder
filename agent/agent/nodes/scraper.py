from agent.utils.model import embeddings_model
from agent.graph import GraphState
from agent.utils.apify import run_amazon_actor
from db.init import SessionLocal
import json

from agent.utils.scorer import calculate_product_score
from db.models import ProductMetricsDB


def scraper_node(state: GraphState):
    print("--- STEP 2: SCRAPING PRODUCTS ---")
    products = run_amazon_actor(state.search_criteria)
    vectors = embeddings_model.embed_documents([p.description for p in products])
    for idx, p in enumerate(products):
        p.score = calculate_product_score(p)
        p.embedding = vectors[idx]

    state.scraped_products = products

    with SessionLocal() as session:
        products_to_add = [
            ProductMetricsDB(
                keyword_searched=p.keyword_searched,
                platform=p.platform.value,
                unique_id=p.unique_id,
                description=p.description,
                price=p.price,
                currency=p.currency.value,
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
        session.add_all(products_to_add)
        session.commit()
        for p in products_to_add:
            session.refresh(p)
        state.scraped_products_id = [p.id for p in products_to_add]

    # state.scraped_products = products
    return state

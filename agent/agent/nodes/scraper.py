from agent.graph import GraphState
from agent.utils.apify import run_amazon_actor
import json

from agent.utils.scorer import calculate_product_score


def scraper_node(state: GraphState):
    print("--- STEP 2: SCRAPING PRODUCTS ---")
    products = run_amazon_actor(state.search_criteria)
    for p in products:
        p.score = calculate_product_score(p)

    with open("result.json", "w") as fp:
        json.dump([p.model_dump(mode="json") for p in products], fp)

    # state.scraped_products = products
    return state

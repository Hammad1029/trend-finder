from agent.graph import GraphState


def scraper_node(state: GraphState):
    print("--- STEP 2: SCRAPING PRODUCTS ---")
    # keywords = state["extracted_keywords"]

    # # Print the keywords to the console
    # print(keywords)

    # Faking the scraper
    fake_products = ["Wooden Train Set", "Eco Doll House"]

    return {"products": fake_products}

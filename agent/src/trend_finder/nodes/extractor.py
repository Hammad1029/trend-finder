"""
Extractor node - extracts search criteria from user request.
"""

from langchain_core.messages import SystemMessage, HumanMessage

from trend_finder.core.state import GraphState
from trend_finder.schemas import SearchCriteria
from trend_finder.config.prompts import EXTRACTOR_SYSTEM_PROMPT
from trend_finder.llm import get_chat_model
from trend_finder.database import get_db, RequestDB, SearchCriteriaDB


def extract_node(state: GraphState) -> GraphState:
    """
    Extract search criteria from user request using LLM.

    This node:
    1. Creates a request record in the database
    2. Uses LLM to extract structured search criteria
    3. Saves criteria to database
    """
    print("--- STEP 1: EXTRACTING KEYWORDS ---")

    user_input = state.user_request

    # Create request record
    with get_db() as session:
        request = RequestDB(user_request=user_input)
        session.add(request)
        session.commit()
        session.refresh(request)
        state.request_id = request.id

    # Extract criteria using LLM
    messages = [
        SystemMessage(content=EXTRACTOR_SYSTEM_PROMPT),
        HumanMessage(content=user_input),
    ]

    chat_model = get_chat_model()
    structured_llm = chat_model.with_structured_output(SearchCriteria)
    response: SearchCriteria = structured_llm.invoke(messages)
    state.search_criteria = response

    # Save to database
    with get_db() as session:
        db_criteria = SearchCriteriaDB(
            primary_keywords=",".join(response.primary_keywords),
            negative_keywords=",".join(response.negative_keywords),
            target_region=response.target_region,
            price_min=response.price_min,
            price_max=response.price_max,
            currency=response.currency,
            vertical_category=response.vertical_category,
            time_horizon_in_months=response.time_horizon_in_months,
            request_id=state.request_id,
        )
        session.add(db_criteria)
        session.commit()
        session.refresh(db_criteria)
        state.search_criteria_id = db_criteria.id

    return state

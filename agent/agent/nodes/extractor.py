from agent.constants.prompts import EXTRACTOR_SYSTEM_PROMPT
from agent.state import GraphState, SearchCriteriaState
from langchain_core.messages import SystemMessage, HumanMessage, chat
from agent.utils.model import chat_model
from db.init import SessionLocal

from db.models import RequestDB


def extract_node(state: GraphState):
    print("--- STEP 1: EXTRACTING KEYWORDS ---")
    user_input = state.user_request
    request = RequestDB(user_request=user_input)

    with SessionLocal() as session:
        session.add(request)
        session.commit()
        session.refresh(request)
        state.request_id = request.id

    messages = [
        SystemMessage(content=EXTRACTOR_SYSTEM_PROMPT),
        HumanMessage(content=user_input),
    ]

    structured_llm = chat_model.with_structured_output(SearchCriteriaState)
    response: SearchCriteriaState = structured_llm.invoke(messages)
    state.search_criteria = response

    # Map state SearchCriteria to DB SearchCriteria
    from db.models import SearchCriteriaDB as DBSearchCriteria

    with SessionLocal() as session:
        db_search_criteria = DBSearchCriteria(
            primary_keywords=response.primary_keywords,
            negative_keywords=response.negative_keywords,
            target_region=response.target_region,
            price_min=response.price_min,
            price_max=response.price_max,
            currency=response.currency,
            vertical_category=response.vertical_category,
            time_horizon_in_months=response.time_horizon_in_months,
            request_id=state.request_id,
        )
        session.add(db_search_criteria)
        session.commit()

    return state

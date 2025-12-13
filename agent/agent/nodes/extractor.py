from agent.prompts import EXTRACTOR_SYSTEM_PROMPT
from agent.state import GraphState, SearchCriteria
from langchain_core.messages import SystemMessage, HumanMessage
from agent.model import model


def extract_node(state: GraphState):
    print("--- STEP 1: EXTRACTING KEYWORDS ---")
    user_input = state.user_request
    messages = [
        SystemMessage(content=EXTRACTOR_SYSTEM_PROMPT),
        HumanMessage(content=user_input),
    ]

    structured_llm = model.with_structured_output(SearchCriteria)
    response: SearchCriteria = structured_llm.invoke(messages)
    state.search_criteria = response
    return state

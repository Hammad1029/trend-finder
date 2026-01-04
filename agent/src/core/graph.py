"""
LangGraph workflow definition.
"""

from langgraph.graph import StateGraph, START, END

from .state import GraphState
from nodes import extract_node, scraper_node, cluster_node


def build_graph():
    """
    Build and compile the LangGraph workflow.

    Returns:
        Compiled LangGraph ready for invocation.
    """
    builder = StateGraph(GraphState)

    # Add nodes
    builder.add_node("extractor", extract_node)
    builder.add_node("scraper", scraper_node)
    builder.add_node("clusterer", cluster_node)

    # Define edges (linear flow)
    builder.add_edge(START, "extractor")
    builder.add_edge("extractor", "scraper")
    builder.add_edge("scraper", "clusterer")
    builder.add_edge("clusterer", END)

    # Compile
    return builder.compile()

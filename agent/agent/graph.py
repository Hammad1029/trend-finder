from langgraph.graph import StateGraph, START, END
from agent.nodes.clusterer import cluster_node
from agent.state import GraphState
from agent.nodes.extractor import extract_node
from agent.nodes.scraper import scraper_node


def buildGraph():
    builder = StateGraph(GraphState)
    builder.add_node("extractor", extract_node)
    builder.add_node("scraper", scraper_node)
    builder.add_node("clusterer", cluster_node)
    builder.add_edge(START, "extractor")
    builder.add_edge("extractor", "scraper")
    builder.add_edge("scraper", "clusterer")
    builder.add_edge("clusterer", END)
    graph = builder.compile()
    return graph

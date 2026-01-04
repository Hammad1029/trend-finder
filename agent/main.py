#!/usr/bin/env python3
"""
Main entry point for the Trend Finder Agent.

This file provides backwards compatibility with the old structure.
For the new structure, use: python -m trend_finder
"""

from dotenv import load_dotenv

# Load environment variables first
load_dotenv()

# Import from new structure
from trend_finder.core import build_graph, GraphState
from trend_finder.database import init_db


def main():
    """Run the trend finder agent."""
    print("--- STARTING THE AGENT ---")

    # Initialize database tables
    init_db()

    # Build and run the graph
    graph = build_graph()
    result = graph.invoke(
        GraphState(user_request="I want trending toys in USA for adhd kids")
    )

    print("\n--- FINAL RESULT ---")
    print(result)

    return result


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Trend Finder Agent - Main entry point.

This agent analyzes e-commerce trends based on user requests.
"""

from dotenv import load_dotenv

# Load environment variables first
load_dotenv()

from core import build_graph, GraphState
from database import init_db


def main():
    """Run the trend finder agent."""
    print("=" * 60)
    print("TREND FINDER AGENT")
    print("=" * 60)

    # Initialize database
    init_db()

    # Build the graph
    graph = build_graph()

    # Example request
    initial_state = GraphState(user_request="I want trending toys in USA for adhd kids")

    # Run the agent
    print("\n--- STARTING THE AGENT ---\n")
    result = graph.invoke(initial_state)

    print("\n" + "=" * 60)
    print("FINAL RESULT")
    print("=" * 60)

    # Pretty print results
    clusters = result.get("clusters")
    if clusters:
        for cluster in clusters:
            print(f"\n📦 Cluster {cluster.label}")
            print(f"   Keywords: {', '.join(cluster.trend_keywords[:5])}")
            print(f"   Products: {len(cluster.products)}")
            if cluster.analytics:
                analytics = cluster.analytics
                print(f"   Avg Price: ${analytics.average_price:.2f}")
                print(f"   Avg Rating: {analytics.average_rating:.1f}⭐")
                if analytics.trend_analytics:
                    trend = analytics.trend_analytics
                    print(f"   Trend: {trend.label} (Score: {trend.final_score})")
                    print(f"   {trend.explanation}")
    else:
        print("No clusters found.")

    return result


if __name__ == "__main__":
    main()

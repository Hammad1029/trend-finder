# agent.py
from dotenv import load_dotenv

load_dotenv()
from agent.graph import buildGraph
from agent.state import GraphState


def main():
    print("--- STARTING THE AGENT ---")

    graph = buildGraph()
    # We invoke the graph with the initial state
    result = graph.invoke(
        GraphState(user_request="I want trending toys in USA for adhd kids")
    )

    print("\n--- FINAL RESULT ---")
    print(result)


if __name__ == "__main__":
    main()

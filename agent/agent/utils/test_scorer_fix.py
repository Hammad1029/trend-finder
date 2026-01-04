import sys
from unittest.mock import MagicMock
from agent.utils.scorer import TrendScorer
from dataforseo_client.api.keywords_data_api import (
    KeywordsDataDataforseoTrendsExploreLiveResponseInfo,
)


def test_analyze_with_none_results():
    scorer = TrendScorer()

    # Mock response with None result
    mock_res = MagicMock(spec=KeywordsDataDataforseoTrendsExploreLiveResponseInfo)
    mock_res.tasks = [MagicMock()]
    mock_res.tasks[0].result = None

    cluster_obj = MagicMock()
    cluster_obj.average_sales_last_month = 100
    cluster_obj.average_review_count = 50

    print("Testing analyze with None results...")
    try:
        scorer.analyze(cluster_obj, mock_res)
        print("Success: analyze handled None results without crashing.")
    except Exception as e:
        print(f"Failed: analyze crashed with error: {e}")
        sys.exit(1)


def test_analyze_with_empty_tasks():
    scorer = TrendScorer()

    mock_res = MagicMock(spec=KeywordsDataDataforseoTrendsExploreLiveResponseInfo)
    mock_res.tasks = []

    cluster_obj = MagicMock()

    print("Testing analyze with empty tasks...")
    try:
        scorer.analyze(cluster_obj, mock_res)
        print("Success: analyze handled empty tasks without crashing.")
    except Exception as e:
        print(f"Failed: analyze crashed with error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    test_analyze_with_none_results()
    test_analyze_with_empty_tasks()

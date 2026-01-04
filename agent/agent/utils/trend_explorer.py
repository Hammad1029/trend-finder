from typing import Optional, List, Any, cast, Sequence
from dataforseo_client import (
    configuration as dfs_config,
    api_client as dfs_api_provider,
)
from dataforseo_client.api.keywords_data_api import (
    KeywordsDataApi,
    KeywordsDataDataforseoTrendsExploreLiveResponseInfo,
)
from dataforseo_client.models.keywords_data_dataforseo_trends_explore_live_request_info import (
    KeywordsDataDataforseoTrendsExploreLiveRequestInfo,
)
import os

username = os.getenv("DATAFORSEO_USERNAME")
password = os.getenv("DATAFORSEO_PASSWORD")

if not username or not password:
    raise ValueError("DATAFORSEO_USERNAME or DATAFORSEO_PASSWORD not found")


def get_trends(
    keywords: Sequence[str],
) -> KeywordsDataDataforseoTrendsExploreLiveResponseInfo:
    # Configure HTTP basic authorization: basicAuth
    configuration = dfs_config.Configuration(username=username, password=password)
    with dfs_api_provider.ApiClient(configuration) as api_client:
        request_info = KeywordsDataDataforseoTrendsExploreLiveRequestInfo(
            keywords=cast(Any, keywords),
        )

        request_list: List[
            KeywordsDataDataforseoTrendsExploreLiveRequestInfo | None
        ] = []
        request_list.append(request_info)

        response = KeywordsDataApi(api_client).dataforseo_trends_explore_live(
            list_optional_keywords_data_dataforseo_trends_explore_live_request_info=request_list
        )

        return response

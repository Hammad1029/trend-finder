"""
DataForSEO service for trend exploration.
"""

from typing import List, Sequence, Any, cast

from dataforseo_client import (
    configuration as dfs_config,
    api_client as dfs_api_provider,
)
from dataforseo_client.api.keywords_data_api import KeywordsDataApi
from dataforseo_client.models.keywords_data_dataforseo_trends_explore_live_request_info import (
    KeywordsDataDataforseoTrendsExploreLiveRequestInfo,
)
from dataforseo_client.models.keywords_data_dataforseo_trends_explore_live_response_info import (
    KeywordsDataDataforseoTrendsExploreLiveResponseInfo,
)

from trend_finder.config import get_settings


class DataForSEOService:
    """Service for interacting with DataForSEO API."""

    def __init__(self, username: str | None = None, password: str | None = None):
        settings = get_settings()
        self.username = username or settings.dataforseo_username
        self.password = password or settings.dataforseo_password

    def get_trends(
        self,
        keywords: Sequence[str],
    ) -> KeywordsDataDataforseoTrendsExploreLiveResponseInfo:
        """
        Get trend data for keywords.

        Args:
            keywords: List of keywords to analyze

        Returns:
            DataForSEO trends response
        """
        configuration = dfs_config.Configuration(
            username=self.username,
            password=self.password,
        )

        with dfs_api_provider.ApiClient(configuration) as api_client:
            request_info = KeywordsDataDataforseoTrendsExploreLiveRequestInfo(
                keywords=cast(Any, keywords),
            )

            request_list: List[
                KeywordsDataDataforseoTrendsExploreLiveRequestInfo | None
            ] = [request_info]

            response = KeywordsDataApi(api_client).dataforseo_trends_explore_live(
                list_optional_keywords_data_dataforseo_trends_explore_live_request_info=request_list
            )

            return response


# Convenience function
def get_trends(
    keywords: Sequence[str],
) -> KeywordsDataDataforseoTrendsExploreLiveResponseInfo:
    """Get trends using default service."""
    service = DataForSEOService()
    return service.get_trends(keywords)

"""
Graph state definition.

This module defines the state that flows through the LangGraph.
It imports from schemas (which have no circular dependencies).
"""

from typing import List
from pydantic import BaseModel, Field

from schemas import (
    SearchCriteria,
    ProductMetrics,
    ProductCluster,
)


class GraphState(BaseModel):
    """
    State object that flows through the LangGraph pipeline.

    This is the single source of truth for the agent's state
    as it progresses through the workflow.
    """

    # 1. Input
    request_id: int = 0
    user_request: str = ""

    # 2. Planning Phase
    search_criteria_id: int = 0
    search_criteria: SearchCriteria = Field(default_factory=SearchCriteria)

    # 3. Execution Phase
    scraped_products_id: List[int] = Field(default_factory=list)
    scraped_products: List[ProductMetrics] = Field(default_factory=list)

    # 4. Analysis Phase
    cluster_ids: List[int] = Field(default_factory=list)
    clusters: List[ProductCluster] = Field(default_factory=list)

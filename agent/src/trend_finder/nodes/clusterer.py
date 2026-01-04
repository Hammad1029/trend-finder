"""
Clusterer node - clusters products and analyzes trends.
"""

from collections import defaultdict
from typing import List

from sklearn.cluster import DBSCAN

from trend_finder.core.state import GraphState
from trend_finder.schemas import ProductMetrics, ProductCluster
from trend_finder.config.constants import CLUSTERER_CONFIG
from trend_finder.services.clustering import (
    ClusterAnalyticsService,
    ClusterKeywordExtractor,
)
from trend_finder.services.external import get_trends
from trend_finder.database import (
    get_db,
    get_session_factory,
    ProductMetricsDB,
    ProductClustersDB,
)


def cluster_node(state: GraphState) -> GraphState:
    """
    Cluster products and analyze trends.

    This node:
    1. Retrieves product embeddings from database
    2. Clusters using DBSCAN
    3. Extracts keywords for each cluster
    4. Fetches trend data
    5. Computes analytics
    6. Saves clusters to database
    """
    print("--- STEP 3: CLUSTERING PRODUCTS ---")

    SessionLocal = get_session_factory()

    with SessionLocal() as session:
        # Fetch products
        db_products = session.query(ProductMetricsDB).filter_by(request_id=state.request_id).all()

        if not db_products:
            return state

        embeddings = [p.embedding for p in db_products]
        if not embeddings:
            return state

        # Cluster using DBSCAN
        clustering_model = DBSCAN(
            eps=CLUSTERER_CONFIG.DBSCAN_EPS,
            min_samples=CLUSTERER_CONFIG.DBSCAN_MIN_SAMPLES,
            metric=CLUSTERER_CONFIG.DBSCAN_METRIC,
        )
        labels = clustering_model.fit_predict(embeddings)

        # Extract keywords
        keyword_extractor = ClusterKeywordExtractor()
        cluster_keywords = keyword_extractor.label_all_clusters(
            [p.description for p in db_products], labels
        )

        # Group products by cluster
        clusters_map: dict[int, List[ProductMetricsDB]] = defaultdict(list)
        for product, label in zip(db_products, labels):
            if label != -1:  # Exclude noise
                clusters_map[int(label)].append(product)

        # Initialize services
        analytics_service = ClusterAnalyticsService()

        # Process each cluster
        for label, cluster_products in clusters_map.items():
            # Get keywords
            trend_keywords = [keyword for keyword, _ in cluster_keywords[label]["keywords"]]

            # Fetch trend data
            keywords_to_query = trend_keywords[: CLUSTERER_CONFIG.CLUSTER_KEYWORDS_LIMIT]
            trend_response = get_trends(keywords_to_query) if keywords_to_query else None

            # Build state cluster
            state_cluster = ProductCluster(
                label=label,
                trend_keywords=trend_keywords,
                products=[_db_to_schema(p) for p in cluster_products],
            )

            # Compute analytics
            analytics = analytics_service.compute_analytics(
                state_cluster.products,
                trend_response,
            )
            state_cluster.analytics = analytics

            state.clusters.append(state_cluster)

            # Save cluster to database
            trend_data = analytics.trend_analytics
            db_cluster = ProductClustersDB(
                label=label,
                request_id=state.request_id,
                trend_keywords=trend_keywords,
                cluster_size=analytics.cluster_size,
                min_price=analytics.min_price,
                max_price=analytics.max_price,
                average_price=analytics.average_price,
                average_sales_last_month=analytics.average_sales_last_month,
                average_rating=analytics.average_rating,
                average_review_count=analytics.average_review_count,
                average_search_ranking=analytics.average_search_ranking,
                average_product_score=analytics.average_product_score,
                trend_final_score=trend_data.final_score if trend_data else 0,
                trend_label=trend_data.label if trend_data else "",
                trend_explanation=trend_data.explanation if trend_data else "",
                trend_search_score=trend_data.search_score if trend_data else 0,
                trend_market_score=trend_data.market_score if trend_data else 0,
                trend_slope=trend_data.slope if trend_data else 0,
                trend_volatility=trend_data.volatility if trend_data else 0,
                trend_sales_volume=trend_data.sales_volume if trend_data else 0,
                trend_saturation_ratio=trend_data.saturation_ratio if trend_data else 0,
            )
            session.add(db_cluster)
            session.flush()

            # Update product cluster references
            for product in cluster_products:
                product.cluster_id = db_cluster.id

            state.cluster_ids.append(db_cluster.id)

        session.commit()

    return state


def _db_to_schema(db_product: ProductMetricsDB) -> ProductMetrics:
    """Convert database product to schema."""
    from trend_finder.schemas import Platforms, Currencies

    return ProductMetrics(
        keyword_searched=db_product.keyword_searched,
        platform=(
            Platforms(db_product.platform)
            if db_product.platform in [p.value for p in Platforms]
            else Platforms.UNKNOWN
        ),
        unique_id=db_product.unique_id,
        description=db_product.description,
        price=db_product.price,
        currency=(
            Currencies(db_product.currency)
            if db_product.currency in [c.value for c in Currencies]
            else Currencies.UNKNOWN
        ),
        image_url=db_product.image_url,
        platform_category=db_product.platform_category,
        platform_region=db_product.platform_region,
        rating=db_product.rating,
        review_count=db_product.review_count,
        sales_last_month=db_product.sales_last_month,
        search_ranking=db_product.search_ranking,
        sponsored=db_product.sponsored,
        score=db_product.score,
        embedding=list(db_product.embedding) if db_product.embedding is not None else [],
    )

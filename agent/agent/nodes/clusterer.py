from agent.utils.scorer import TrendScorer
from typing import List
from agent.constants.enums import ClustererConstants
from agent.utils.cluster_analytics import ClusterAnalytics
from agent.utils.keyword_extractor import ClusterKeywordExtractor
from agent.state import ProductMetricsState
from collections import defaultdict
from sklearn.cluster._dbscan import DBSCAN
from agent.state import GraphState, ProductClustersState
from agent.utils.trend_explorer import get_trends
from db.init import SessionLocal
from db.models import ProductMetricsDB, ProductClustersDB


def cluster_node(state: GraphState):
    with SessionLocal() as session:
        products = (
            session.query(ProductMetricsDB).filter_by(request_id=state.request_id).all()
        )

        if not products:
            return state

        embeddings = [product.embedding for product in products]
        if not embeddings:
            return state

        clustering_model = DBSCAN(
            eps=ClustererConstants.DBSCAN_EPS.value,
            min_samples=ClustererConstants.DBSCAN_MIN_SAMPLES.value,
            metric=ClustererConstants.DBSCAN_METRIC.value,
        )
        labels = clustering_model.fit_predict(embeddings)

        keyword_extractor = ClusterKeywordExtractor()
        cluster_keywords = keyword_extractor.label_all_clusters(
            [p.description for p in products], labels
        )

        clusters = defaultdict(list)
        for product, label in zip(products, labels):
            if label != -1:
                clusters[int(label)].append(product)

        for label, cluster_products in clusters.items():

            trend_keywords = [
                keyword for keyword, _ in cluster_keywords[label]["keywords"]
            ]
            trend_res = get_trends(
                trend_keywords[: ClustererConstants.CLUSTER_KEYWORDS_LIMIT.value],
            )

            state_cluster = ProductClustersState(
                label=label,
                trend_keywords=trend_keywords,
            )

            for p in cluster_products:
                state_cluster.products.append(
                    ProductMetricsState(
                        keyword_searched=p.keyword_searched,
                        platform=p.platform,
                        unique_id=p.unique_id,
                        description=p.description,
                        price=p.price,
                        currency=p.currency,
                        image_url=p.image_url,
                        platform_category=p.platform_category,
                        platform_region=p.platform_region,
                        rating=p.rating,
                        review_count=p.review_count,
                        sales_last_month=p.sales_last_month,
                        search_ranking=p.search_ranking,
                        sponsored=p.sponsored,
                        score=p.score,
                        embedding=p.embedding,
                    )
                )

            analytics = ClusterAnalytics(state_cluster.products)
            analytics.trend_analytics = TrendScorer(state_cluster, trend_res)

            state_cluster.analytics = analytics
            state.clusters.append(state_cluster)

            cluster = ProductClustersDB(
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
                trend_final_score=analytics.trend_analytics.final_score,
                trend_label=analytics.trend_analytics.label,
                trend_explanation=analytics.trend_analytics.explanation,
                trend_search_score=analytics.trend_analytics.search_score,
                trend_market_score=analytics.trend_analytics.market_score,
                trend_slope=analytics.trend_analytics.slope,
                trend_volatility=analytics.trend_analytics.volatility,
                trend_sales_volume=analytics.trend_analytics.sales_volume,
                trend_saturation_ratio=analytics.trend_analytics.saturation_ratio,
            )
            session.add(cluster)
            session.flush()

            for product in cluster_products:
                product.cluster_id = cluster.id

            state.cluster_ids.append(cluster.id)

        session.commit()
        return state

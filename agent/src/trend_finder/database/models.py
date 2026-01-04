"""
SQLAlchemy ORM models for the database.
"""

from typing import List, Optional

from sqlalchemy import ForeignKey, String, Integer, Boolean, Float
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector


class Base(DeclarativeBase):
    """Base class for all ORM models."""

    pass


class RequestDB(Base):
    """User request record."""

    __tablename__ = "requests"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_request: Mapped[str] = mapped_column(String(255))

    # Relationships
    search_criteria: Mapped["SearchCriteriaDB"] = relationship(
        back_populates="request", cascade="all, delete-orphan"
    )
    product_metrics: Mapped[List["ProductMetricsDB"]] = relationship(
        back_populates="request", cascade="all, delete-orphan"
    )
    product_clusters: Mapped[List["ProductClustersDB"]] = relationship(
        back_populates="request", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"Request(id={self.id!r}, user_request={self.user_request!r})"


class SearchCriteriaDB(Base):
    """Extracted search criteria record."""

    __tablename__ = "search_criteria"

    id: Mapped[int] = mapped_column(primary_key=True)
    primary_keywords: Mapped[str] = mapped_column(String(255))
    negative_keywords: Mapped[str] = mapped_column(String(255))
    target_region: Mapped[str] = mapped_column(String(10))
    price_min: Mapped[int] = mapped_column(Integer)
    price_max: Mapped[int] = mapped_column(Integer)
    currency: Mapped[str] = mapped_column(String(10))
    vertical_category: Mapped[str] = mapped_column(String(50))
    time_horizon_in_months: Mapped[int] = mapped_column(Integer)

    # Foreign key
    request_id: Mapped[int] = mapped_column(ForeignKey("requests.id"))
    request: Mapped["RequestDB"] = relationship(back_populates="search_criteria")

    def __repr__(self) -> str:
        return f"SearchCriteria(id={self.id!r}, keywords={self.primary_keywords!r})"


class ProductMetricsDB(Base):
    """Scraped product metrics record."""

    __tablename__ = "product_metrics"

    id: Mapped[int] = mapped_column(primary_key=True)

    # Product info
    keyword_searched: Mapped[str] = mapped_column(String(255))
    platform: Mapped[str] = mapped_column(String(50))
    unique_id: Mapped[str] = mapped_column(String(50))
    description: Mapped[str] = mapped_column(String(1000))
    price: Mapped[float] = mapped_column(Float)
    currency: Mapped[str] = mapped_column(String(10))
    image_url: Mapped[str] = mapped_column(String(255))
    platform_category: Mapped[str] = mapped_column(String(50))
    platform_region: Mapped[str] = mapped_column(String(10))

    # Metrics
    rating: Mapped[float] = mapped_column(Float)
    review_count: Mapped[int] = mapped_column(Integer)
    sales_last_month: Mapped[int] = mapped_column(Integer)
    search_ranking: Mapped[int] = mapped_column(Integer)
    sponsored: Mapped[bool] = mapped_column(Boolean)
    score: Mapped[float] = mapped_column(Float)

    # Embedding vector
    embedding: Mapped[Vector] = mapped_column(Vector(1536))

    # Foreign keys
    request_id: Mapped[int] = mapped_column(ForeignKey("requests.id"))
    request: Mapped["RequestDB"] = relationship(back_populates="product_metrics")

    cluster_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("product_clusters.id"), nullable=True
    )
    cluster: Mapped[Optional["ProductClustersDB"]] = relationship(
        back_populates="product_metrics"
    )


class ProductClustersDB(Base):
    """Product cluster record."""

    __tablename__ = "product_clusters"

    id: Mapped[int] = mapped_column(primary_key=True)
    label: Mapped[int] = mapped_column(Integer)

    # Trend info
    trend_keywords: Mapped[List[str]] = mapped_column(ARRAY(String), default=list)
    trend_final_score: Mapped[float] = mapped_column(Float)
    trend_label: Mapped[str] = mapped_column(String(50))
    trend_explanation: Mapped[str] = mapped_column(String(1000))
    trend_search_score: Mapped[float] = mapped_column(Float)
    trend_market_score: Mapped[float] = mapped_column(Float)
    trend_slope: Mapped[float] = mapped_column(Float)
    trend_volatility: Mapped[float] = mapped_column(Float)
    trend_sales_volume: Mapped[int] = mapped_column(Integer)
    trend_saturation_ratio: Mapped[float] = mapped_column(Float)

    # Analytics
    cluster_size: Mapped[int] = mapped_column(Integer)
    min_price: Mapped[float] = mapped_column(Float)
    max_price: Mapped[float] = mapped_column(Float)
    average_price: Mapped[float] = mapped_column(Float)
    average_sales_last_month: Mapped[int] = mapped_column(Integer)
    average_rating: Mapped[float] = mapped_column(Float)
    average_review_count: Mapped[int] = mapped_column(Integer)
    average_search_ranking: Mapped[int] = mapped_column(Integer)
    average_product_score: Mapped[float] = mapped_column(Float)

    # Foreign key
    request_id: Mapped[int] = mapped_column(ForeignKey("requests.id"))
    request: Mapped["RequestDB"] = relationship(back_populates="product_clusters")

    # Relationship
    product_metrics: Mapped[List["ProductMetricsDB"]] = relationship(
        back_populates="cluster", cascade="all, delete-orphan"
    )

"""
Application settings using Pydantic Settings.

Environment variables are loaded from .env file.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application configuration loaded from environment."""

    # Database
    database_url: str = Field(..., validation_alias="DATABASE_URL")

    # API Keys
    openai_api_key: str = Field(..., validation_alias="OPENAI_API_KEY")
    apify_token: str = Field(..., validation_alias="APIFY_TOKEN")
    dataforseo_username: str = Field(..., validation_alias="DATAFORSEO_USERNAME")
    dataforseo_password: str = Field(..., validation_alias="DATAFORSEO_PASSWORD")

    # Environment
    env: str = Field(default="production", validation_alias="ENV")

    # LLM Configuration
    chat_model: str = Field(default="gpt-4o-mini")
    embeddings_model: str = Field(default="text-embedding-3-small")
    temperature: float = Field(default=0.1)

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()

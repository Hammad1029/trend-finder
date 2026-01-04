"""
LLM model initialization.
"""

from functools import lru_cache

from langchain_openai import ChatOpenAI, OpenAIEmbeddings

from config import get_settings


@lru_cache
def get_chat_model() -> ChatOpenAI:
    """Get the chat model instance."""
    settings = get_settings()
    return ChatOpenAI(
        model=settings.chat_model,
        temperature=settings.temperature,
        api_key=settings.openai_api_key,
    )


@lru_cache
def get_embeddings_model() -> OpenAIEmbeddings:
    """Get the embeddings model instance."""
    settings = get_settings()
    return OpenAIEmbeddings(
        model=settings.embeddings_model,
        api_key=settings.openai_api_key,
    )

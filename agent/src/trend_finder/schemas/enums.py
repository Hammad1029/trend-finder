"""
Enumeration types for the trend finder application.
"""

from enum import Enum


class Platforms(str, Enum):
    """Supported e-commerce platforms."""

    AMAZON = "amazon"
    UNKNOWN = "unknown"


class Currencies(str, Enum):
    """Supported currency codes."""

    USD = "USD"
    EUR = "EUR"
    GBP = "GBP"
    UNKNOWN = "unknown"


class TrendLabel(str, Enum):
    """Classification labels for trends."""

    DEAD = "Dead 💀"
    SATURATED = "Saturated 🛑"
    DECLINING = "Declining 📉"
    VIRAL = "Viral 🚀"
    GROWTH = "Growth 🔥"
    STABLE = "Stable 🟢"
    SPECULATIVE = "Speculative 🎲"
    UNKNOWN = "Unknown ❓"

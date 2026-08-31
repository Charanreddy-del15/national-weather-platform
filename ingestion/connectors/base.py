"""
BaseConnector — Interface definition for all weather data ingestion connectors.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any


class BaseConnector(ABC):
    """
    Standard interface for pluggable data ingestion connectors.
    """

    def __init__(self, source_id: str, source_name: str, source_type: str, polling_interval_sec: int = 300):
        self.source_id = source_id
        self.source_name = source_name
        self.source_type = source_type
        self.polling_interval_sec = polling_interval_sec
        self.is_active = True

    @abstractmethod
    def connect(self) -> bool:
        """Establishes connection to external API, RSS feed, or data service."""
        pass

    @abstractmethod
    def fetch((self) -> List[Dict[str, Any]]:
        """Retrieves raw payloads or messages from the source provider."""
        pass

    @abstractmethod
    def normalize(self, raw_item: Dict[str, Any]) -> Dict[str, Any]:
        """Maps raw source data into the Unified Weather Event Schema."""
        pass

    @abstractmethod
    def validate(self, normalized_item: Dict[str, Any]) -> bool:
        """Validates that required schema fields are present and valid."""
        pass

    def publish(self, normalized_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Pushes validated events into the ingestion processing queue."""
        valid_items = []
        for item in normalized_items:
            if self.validate(item):
                valid_items.append(item)
        return valid_items

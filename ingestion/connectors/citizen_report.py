"""
Citizen Report Connector — Ingests crowdsourced citizen reports submitted via the web dashboard.
"""

from typing import List, Dict, Any
import datetime
import uuid
from ingestion.connectors.base import BaseConnector


class CitizenReportConnector(BaseConnector):
    """Processes citizen-submitted weather observation reports."""

    def __init__(self):
        super().__init__(
            source_id="src_citizen_portal",
            source_name="National Citizen Reporting Portal",
            source_type="CITIZEN",
            polling_interval_sec=0
        )

    def connect(self) -> bool:
        return True

    def fetch(self) -> List[Dict[str, Any]]:
        return []

    def normalize(self, raw_item: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "event_id": str(uuid.uuid4()),
            "source_id": self.source_id,
            "source_type": self.source_type,
            "source_name": self.source_name,
            "author_name": raw_item.get("reporter_name", "Anonymous Citizen"),
            "raw_text": raw_item["description"],
            "event_category": raw_item.get("category", "Other"),
            "severity": raw_item.get("severity", 3),
            "country": "India",
            "state": raw_item["state"],
            "district": raw_item.get("district", raw_item.get("city")),
            "city": raw_item["city"],
            "latitude": float(raw_item["latitude"]),
            "longitude": float(raw_item["longitude"]),
            "location_confidence": 0.95 if raw_item.get("has_gps") else 0.70,
            "media_url": raw_item.get("media_url"),
            "timestamp": raw_item.get("timestamp", datetime.datetime.utcnow().isoformat() + "Z")
        }

    def validate(self, normalized_item: Dict[str, Any]) -> bool:
        return bool(normalized_item.get("raw_text") and normalized_item.get("state"))

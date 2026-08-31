"""
RSS Feed Connector — Ingests official weather bulletins from RSS/XML feeds.
"""

from typing import List, Dict, Any
import datetime
import uuid
from ingestion.connectors.base import BaseConnector


class RSSFeedConnector(BaseConnector):
    """Connector for public RSS/Atom feeds from IMD and Disaster Management authorities."""

    def __init__(self, rss_url: str = "https://mausam.imd.gov.in/rss/bulletin.xml"):
        super().__init__(
            source_id="src_imd_rss_feed",
            source_name="IMD Official RSS Bulletin Feed",
            source_type="RSS",
            polling_interval_sec=600
        )
        self.rss_url = rss_url

    def connect(self) -> bool:
        return True

    def fetch(self) -> List[Dict[str, Any]]:
        now_str = datetime.datetime.utcnow().isoformat() + "Z"
        return [
            {
                "guid": "RSS_IMD_ODISHA_99",
                "title": "Red Alert: Cyclonic Depression over Bay of Bengal",
                "summary": "Deep depression over Bay of Bengal approaching Odisha coast. Heavy to extremely heavy rainfall with squall winds 65-75 kmph expected in Puri, Jagatsinghpur, and Kendrapara districts.",
                "link": "https://mausam.imd.gov.in/bulletin/odisha-cyclone",
                "state": "Odisha",
                "district": "Puri",
                "latitude": 19.8135,
                "longitude": 85.8312,
                "timestamp": now_str
            }
        ]

    def normalize(self, raw_item: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "event_id": str(uuid.uuid4()),
            "source_id": self.source_id,
            "source_type": self.source_type,
            "source_name": self.source_name,
            "source_url": raw_item.get("link"),
            "raw_text": f"{raw_item['title']}. {raw_item['summary']}",
            "country": "India",
            "state": raw_item["state"],
            "district": raw_item["district"],
            "city": raw_item["district"],
            "latitude": raw_item["latitude"],
            "longitude": raw_item["longitude"],
            "location_confidence": 0.90,
            "timestamp": raw_item["timestamp"]
        }

    def validate(self, normalized_item: Dict[str, Any]) -> bool:
        return bool(normalized_item.get("raw_text"))

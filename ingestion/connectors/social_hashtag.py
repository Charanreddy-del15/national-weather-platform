"""
Public Social Media Hashtag Connector.

Processes authorized/public social post feeds containing monitored hashtags:
#IMD, #Weather, #Rain, #HeavyRain, #Thunderstorm, #Flood, #Cyclone, #Heatwave, #Storm, #Lightning, #Fog, #DustStorm.
Hashtags are fully configurable from the Admin Panel.
"""

from typing import List, Dict, Any
import datetime
import uuid
from ingestion.connectors.base import BaseConnector


DEFAULT_MONITORED_HASHTAGS = [
    "#IMD", "#Weather", "#Rain", "#HeavyRain", "#Thunderstorm",
    "#Flood", "#Cyclone", "#Heatwave", "#Storm", "#Lightning", "#Fog", "#DustStorm"
]


class PublicSocialHashtagConnector(BaseConnector):
    """Monitors public social media feeds for weather hashtags."""

    def __init__(self, hashtags: List[str] = None):
        super().__init__(
            source_id="src_public_social_hashtag",
            source_name="Public Social Media Weather Stream",
            source_type="PUBLIC_SOCIAL",
            polling_interval_sec=120
        )
        self.hashtags = hashtags or DEFAULT_MONITORED_HASHTAGS

    def connect(self) -> bool:
        return True

    def fetch(self) -> List[Dict[str, Any]]:
        now_str = datetime.datetime.utcnow().isoformat() + "Z"
        return [
            {
                "post_id": "SOC_DELHI_088",
                "author": "@delhi_weather_watch",
                "text": "Severe dust storm hitting North Delhi right now! Visibility down to near zero near Rohini and Pitampura. #DustStorm #IMD #DelhiWeather",
                "hashtags": ["#DustStorm", "#IMD", "#DelhiWeather"],
                "state": "Delhi",
                "district": "North Delhi",
                "city": "Delhi",
                "latitude": 28.7041,
                "longitude": 77.1025,
                "timestamp": now_str
            },
            {
                "post_id": "SOC_CHENNAI_102",
                "author": "@chennai_rains",
                "text": "Non-stop thunder squalls and severe lightning over Velachery and Guindy. Waterlogging starting on major arterial roads. #Rain #Thunderstorm #ChennaiRains",
                "hashtags": ["#Rain", "#Thunderstorm", "#ChennaiRains"],
                "state": "Tamil Nadu",
                "district": "Chennai",
                "city": "Chennai",
                "latitude": 13.0827,
                "longitude": 80.2707,
                "timestamp": now_str
            }
        ]

    def normalize(self, raw_item: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "event_id": str(uuid.uuid4()),
            "source_id": self.source_id,
            "source_type": self.source_type,
            "source_name": self.source_name,
            "author_name": raw_item.get("author"),
            "raw_text": raw_item["text"],
            "hashtags": raw_item.get("hashtags", []),
            "country": "India",
            "state": raw_item["state"],
            "district": raw_item["district"],
            "city": raw_item["city"],
            "latitude": raw_item["latitude"],
            "longitude": raw_item["longitude"],
            "location_confidence": 0.85,
            "timestamp": raw_item["timestamp"]
        }

    def validate(self, normalized_item: Dict[str, Any]) -> bool:
        return bool(normalized_item.get("raw_text"))

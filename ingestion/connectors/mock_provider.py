"""
Mock External Provider Connector — Simulates real-time telemetry from external data providers.
"""

from typing import List, Dict, Any
import datetime
import uuid
import random
from ingestion.connectors.base import BaseConnector


INDIAN_CITIES = [
    {"city": "Hyderabad", "district": "Hyderabad", "state": "Telangana", "lat": 17.3850, "lng": 78.4867},
    {"city": "Bengaluru", "district": "Bengaluru Urban", "state": "Karnataka", "lat": 12.9716, "lng": 77.5946},
    {"city": "Kolkata", "district": "Kolkata", "state": "West Bengal", "lat": 22.5726, "lng": 88.3639},
    {"city": "Jaipur", "district": "Jaipur", "state": "Rajasthan", "lat": 26.9124, "lng": 75.7873},
    {"city": "Guwahati", "district": "Kamrup Metropolitan", "state": "Assam", "lat": 26.1445, "lng": 91.7362},
    {"city": "Srinagar", "district": "Srinagar", "state": "Jammu & Kashmir", "lat": 34.0837, "lng": 74.7973},
    {"city": "Bhubaneswar", "district": "Khurda", "state": "Odisha", "lat": 20.2961, "lng": 85.8245},
    {"city": "Ahmedabad", "district": "Ahmedabad", "state": "Gujarat", "lat": 23.0225, "lng": 72.5714}
]

EVENT_PROMPTS = [
    ("Heavy Rainfall", "Heavy downpour continuing over the past 4 hours. Low-lying urban sectors facing water stagnation.", 4),
    ("Thunderstorm", "Thunder squall accompanied by intense lightning strikes and gusty winds up to 55 km/h.", 3),
    ("Heatwave", "Severe heatwave conditions persisting with maximum temperature crossing 44.5°C.", 4),
    ("Fog", "Dense fog layer reducing morning highway visibility to under 50 meters.", 2),
    ("Flash Floods", "Sudden overflow of local drainage basin inundating residential areas.", 5)
]


class MockExternalProviderConnector(BaseConnector):
    """Simulates real-time external data provider streams for testing."""

    def __init__(self):
        super().__init__(
            source_id="src_ext_provider_sim",
            source_name="Global Weather Telemetry Provider",
            source_type="PROVIDER",
            polling_interval_sec=180
        )

    def connect(self) -> bool:
        return True

    def fetch(self) -> List[Dict[str, Any]]:
        now_str = datetime.datetime.utcnow().isoformat() + "Z"
        loc = random.choice(INDIAN_CITIES)
        evt_type, text_template, default_sev = random.choice(EVENT_PROMPTS)

        return [
            {
                "sim_id": str(uuid.uuid4()),
                "city": loc["city"],
                "district": loc["district"],
                "state": loc["state"],
                "latitude": loc["lat"] + random.uniform(-0.02, 0.02),
                "longitude": loc["lng"] + random.uniform(-0.02, 0.02),
                "category": evt_type,
                "text": f"[{loc['city']}] {text_template}",
                "severity": default_sev,
                "timestamp": now_str
            }
        ]

    def normalize(self, raw_item: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "event_id": str(uuid.uuid4()),
            "source_id": self.source_id,
            "source_type": self.source_type,
            "source_name": self.source_name,
            "raw_text": raw_item["text"],
            "event_category": raw_item["category"],
            "severity": raw_item["severity"],
            "country": "India",
            "state": raw_item["state"],
            "district": raw_item["district"],
            "city": raw_item["city"],
            "latitude": raw_item["latitude"],
            "longitude": raw_item["longitude"],
            "location_confidence": 0.92,
            "timestamp": raw_item["timestamp"]
        }

    def validate(self, normalized_item: Dict[str, Any]) -> bool:
        return bool(normalized_item.get("raw_text"))

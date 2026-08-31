"""
Ingestion Pipeline Coordinator.

Orchestrates all source connectors, normalizes incoming raw streams, calls AI classification,
calculates trust verification scores, performs duplicate detection, and persists into DB.
"""

from typing import List, Dict, Any
from ingestion.connectors.weather_api import OpenWeatherGovAPIConnector
from ingestion.connectors.rss_feed import RSSFeedConnector
from ingestion.connectors.social_hashtag import PublicSocialHashtagConnector
from ingestion.connectors.citizen_report import CitizenReportConnector
from ingestion.connectors.mock_provider import MockExternalProviderConnector
from ml.classification.classifier import WeatherEventClassifier
from ml.verification.trust_engine import TrustVerificationEngine
from ml.deduplication.deduplicator import EventDeduplicator


class IngestionPipeline:
    """
    Central Pipeline Supervisor for National Weather Ingestion.
    """

    def __init__(self):
        self.connectors = [
            OpenWeatherGovAPIConnector(),
            RSSFeedConnector(),
            PublicSocialHashtagConnector(),
            MockExternalProviderConnector()
        ]
        self.citizen_connector = CitizenReportConnector()
        self.classifier = WeatherEventClassifier()
        self.trust_engine = TrustVerificationEngine()
        self.deduplicator = EventDeduplicator()

    def run_cycle(self, existing_events: List[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Executes a single ingestion cycle across active source connectors.
        """
        existing_events = existing_events or []
        processed_events = []

        for connector in self.connectors:
            if not connector.is_active:
                continue

            try:
                connector.connect()
                raw_items = connector.fetch()
                for raw in raw_items:
                    normalized = connector.normalize(raw)
                    if connector.validate(normalized):
                        processed = self.process_event(normalized, existing_events + processed_events)
                        processed_events.append(processed)
            except Exception as e:
                print(f"[IngestionPipeline] Error executing connector {connector.source_id}: {str(e)}")

        return processed_events

    def process_event(self, normalized_event: Dict[str, Any], existing_events: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Processes a single normalized event through AI classification, trust scoring, and deduplication.
        """
        raw_text = normalized_event.get("raw_text", "")

        # 1. AI Classification
        ai_res = self.classifier.predict(raw_text)
        category = normalized_event.get("event_category") or ai_res["predicted_category"]
        severity = normalized_event.get("severity") or ai_res["severity_score"]
        ai_confidence = ai_res["confidence_score"]

        normalized_event["event_category"] = category
        normalized_event["severity"] = severity
        normalized_event["ai_confidence"] = ai_confidence

        # 2. Duplicate Detection
        dup_match = self.deduplicator.find_duplicate(normalized_event, existing_events)
        if dup_match:
            normalized_event["is_duplicate"] = True
            normalized_event["parent_event_id"] = dup_match["parent_event_id"]
            normalized_event["duplicate_score"] = dup_match["duplicate_score"]
        else:
            normalized_event["is_duplicate"] = False
            normalized_event["parent_event_id"] = None
            normalized_event["duplicate_score"] = 0.0

        # 3. Trust & Verification Scoring
        trust_res = self.trust_engine.calculate_trust_score(
            source_type=normalized_event.get("source_type", "OTHER"),
            has_gps=bool(normalized_event.get("latitude") and normalized_event.get("longitude")),
            has_media=bool(normalized_event.get("media_url")),
            ai_confidence=ai_confidence,
            location_confidence=normalized_event.get("location_confidence", 0.80),
            is_duplicate=normalized_event["is_duplicate"]
        )

        normalized_event["trust_score"] = trust_res["trust_score"]
        normalized_event["verification_status"] = trust_res["verification_status"]

        return normalized_event

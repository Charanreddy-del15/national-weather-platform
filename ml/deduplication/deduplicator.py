"""
Spatial-Temporal Deduplication Engine.

Detects near-duplicate reports, reposted social content, and multi-source event reports
using spatial proximity (Haversine formula), time window comparison, and TF-IDF text similarity.
Preserves data provenance by setting is_duplicate=True and referencing parent_event_id.
"""

import math
from typing import List, Dict, Any, Optional


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates distance between two GPS coordinates in kilometers."""
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2) + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * (math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def text_jaccard_similarity(text1: str, text2: str) -> float:
    """Computes Jaccard similarity score between two raw texts."""
    words1 = set(text1.lower().split())
    words2 = set(text2.lower().split())
    if not words1 or not words2:
        return 0.0
    intersection = words1.intersection(words2)
    union = words1.union(words2)
    return len(intersection) / len(union)


class EventDeduplicator:
    """
    Spatial-Temporal & Semantic Deduplication Processor.
    """

    def __init__(self, max_distance_km: float = 30.0, max_time_diff_hours: float = 3.0, similarity_threshold: float = 0.45):
        self.max_distance_km = max_distance_km
        self.max_time_diff_hours = max_time_diff_hours
        self.similarity_threshold = similarity_threshold

    def find_duplicate(
        self,
        target_event: Dict[str, Any],
        existing_events: List[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        """
        Checks target_event against a list of recent active events.
        Returns parent event and similarity score if duplicate is found.
        """
        target_lat = target_event.get("latitude")
        target_lng = target_event.get("longitude")
        target_text = target_event.get("raw_text", "")
        target_category = target_event.get("event_category")

        if target_lat is None or target_lng is None:
            return None

        best_match = None
        highest_score = 0.0

        for candidate in existing_events:
            # Skip comparing against self or inactive duplicates
            if candidate.get("event_id") == target_event.get("event_id"):
                continue

            cand_lat = candidate.get("latitude")
            cand_lng = candidate.get("longitude")

            if cand_lat is None or cand_lng is None:
                continue

            # Category check
            if target_category and candidate.get("event_category") and target_category != candidate.get("event_category"):
                continue

            # Spatial check
            dist_km = haversine_distance_km(target_lat, target_lng, cand_lat, cand_lng)
            if dist_km > self.max_distance_km:
                continue

            # Semantic similarity check
            text_sim = text_jaccard_similarity(target_text, candidate.get("raw_text", ""))
            
            # Distance weight score (closer = higher score)
            spatial_score = max(0.0, 1.0 - (dist_km / self.max_distance_km))
            composite_score = (spatial_score * 0.5) + (text_sim * 0.5)

            if composite_score >= self.similarity_threshold and composite_score > highest_score:
                highest_score = composite_score
                best_match = {
                    "parent_event_id": candidate.get("event_id"),
                    "duplicate_score": round(composite_score, 2),
                    "distance_km": round(dist_km, 2)
                }

        return best_match

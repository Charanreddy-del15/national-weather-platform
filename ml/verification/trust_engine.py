"""
Trust & Verification Engine for Weather Reports.

Calculates multi-factor weighted reliability scores and assigns automated statuses:
- UNVERIFIED
- UNDER_REVIEW
- VERIFIED
- REJECTED
- FLAGGED
- DUPLICATE
"""

from typing import Dict, Any


SOURCE_RELIABILITY_WEIGHTS = {
    "GOVT_API": 0.95,
    "OPEN_DATA": 0.90,
    "RSS": 0.85,
    "PUBLIC_SOCIAL": 0.60,
    "CITIZEN": 0.50,
    "PROVIDER": 0.80
}


class TrustVerificationEngine:
    """
    Weighted Multi-Factor Trust & Verification Engine.
    """

    def __init__(self):
        self.weights = {
            "source": 0.30,
            "location": 0.20,
            "timestamp": 0.15,
            "ai_confidence": 0.15,
            "cross_source": 0.10,
            "metadata_completeness": 0.10
        }

    def calculate_trust_score(
        self,
        source_type: str,
        has_gps: bool,
        has_media: bool,
        ai_confidence: float,
        location_confidence: float,
        is_duplicate: bool = False,
        cross_source_count: int = 1
    ) -> Dict[str, Any]:
        """
        Calculates a trust score between 0.00 and 1.00.
        """
        source_score = SOURCE_RELIABILITY_WEIGHTS.get(source_type.upper(), 0.50)
        location_score = location_confidence if has_gps else (location_confidence * 0.7)
        timestamp_score = 0.90  # Valid timestamp format
        cross_source_score = min(1.0, 0.5 + (cross_source_count - 1) * 0.25)
        metadata_score = 1.0 if (has_gps and has_media) else (0.7 if (has_gps or has_media) else 0.4)

        raw_score = (
            (source_score * self.weights["source"]) +
            (location_score * self.weights["location"]) +
            (timestamp_score * self.weights["timestamp"]) +
            (ai_confidence * self.weights["ai_confidence"]) +
            (cross_source_score * self.weights["cross_source"]) +
            (metadata_score * self.weights["metadata_completeness"])
        )

        if is_duplicate:
            raw_score *= 0.85  # Penalty for duplicate status

        trust_score = round(min(1.0, max(0.0, raw_score)), 2)

        # Status determination
        if is_duplicate:
            status = "DUPLICATE"
        elif trust_score >= 0.80:
            status = "VERIFIED"
        elif trust_score >= 0.55:
            status = "UNDER_REVIEW"
        elif trust_score >= 0.35:
            status = "UNVERIFIED"
        else:
            status = "FLAGGED"

        return {
            "trust_score": trust_score,
            "verification_status": status,
            "score_breakdown": {
                "source_score": round(source_score, 2),
                "location_score": round(location_score, 2),
                "timestamp_score": round(timestamp_score, 2),
                "ai_confidence": round(ai_confidence, 2),
                "cross_source_score": round(cross_source_score, 2),
                "metadata_score": round(metadata_score, 2)
            }
        }

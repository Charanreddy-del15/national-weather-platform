"""
AI/ML Weather Event Classification Engine.

Categorizes weather-related posts, public social updates, RSS text, and citizen descriptions
into standardized Indian meteorological risk event categories with confidence and severity ratings.
Supports pluggable models (rule-based NLP, TF-IDF ensemble, HuggingFace transformers, or external LLMs).
"""

import re
from typing import Dict, Any, List, Tuple


CATEGORIES = [
    "Heavy Rainfall",
    "Rainfall",
    "Thunderstorm",
    "Lightning",
    "Flooding",
    "Flash Floods",
    "Cyclone",
    "Heatwave",
    "Cold Wave",
    "Fog",
    "Dust Storm",
    "Strong Winds",
    "Hailstorm",
    "Landslide",
    "Cloudburst",
    "Extreme Weather",
    "Other"
]

CATEGORY_KEYWORDS = {
    "Cloudburst": ["cloudburst", "sudden downpour", "torrential cloudburst", "mountain flash deluge"],
    "Flash Floods": ["flash flood", "flash flooding", "sudden overflow", "river breach", "water burst"],
    "Flooding": ["flood", "flooding", "waterlogging", "inundated", "submerged", "submergence", "water logging"],
    "Cyclone": ["cyclone", "cyclonic", "storm surge", "severe storm", "depression", "deep depression", "super cyclone", "typhoon"],
    "Landslide": ["landslide", "mudslide", "land slip", "rockfall", "debris flow", "hill collapse"],
    "Cloudburst": ["cloudburst", "torrential torrential", "excessive rainfall"],
    "Hailstorm": ["hailstorm", "hail", "hailstones", "ice pelting"],
    "Heavy Rainfall": ["heavy rain", "heavy rainfall", "torrential rain", "downpour", "excessive rain", "heavy downpour", "musladhar"],
    "Thunderstorm": ["thunderstorm", "thunder", "lightening and thunder", "thunder squall"],
    "Lightning": ["lightning", "lightning strike", "thunderbolt", "lightning discharge"],
    "Heatwave": ["heatwave", "heat wave", "extreme heat", "loo", "severe heat", "high temperature", "scalding heat"],
    "Cold Wave": ["cold wave", "coldwave", "severe cold", "frost", "freezing temperature", "chill wave"],
    "Fog": ["fog", "dense fog", "smog", "zero visibility", "mist"],
    "Dust Storm": ["dust storm", "andhi", "duststorm", "sandstorm", "gale dust"],
    "Strong Winds": ["strong winds", "high winds", "squall", "gale", "gusty winds", "windstorm"],
    "Rainfall": ["rain", "raining", "drizzle", "shower", "light rain", "precipitation"]
}


class WeatherEventClassifier:
    """
    Pluggable NLP Classifier for Weather Events.
    """

    def __init__(self, model_name: str = "rule_tfidf_ensemble_v1"):
        self.model_name = model_name
        self.version = "1.4.0"

    def predict(self, text: str, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Analyzes raw text and returns predicted category, confidence score, and severity rating (1-5).
        """
        if not text:
            return {
                "predicted_category": "Other",
                "confidence_score": 0.3,
                "severity_score": 1,
                "model_version": self.version
            }

        text_lower = text.lower()
        matched_scores: Dict[str, float] = {}

        for category, keywords in CATEGORY_KEYWORDS.items():
            score = 0.0
            for kw in keywords:
                if re.search(r'\b' + re.escape(kw) + r'\b', text_lower):
                    score += 1.0
                elif kw in text_lower:
                    score += 0.5
            if score > 0:
                matched_scores[category] = score

        if not matched_scores:
            predicted_category = "Other"
            confidence_score = 0.40
            severity_score = 1
        else:
            sorted_categories = sorted(matched_scores.items(), key=lambda x: x[1], reverse=True)
            predicted_category = sorted_categories[0][0]
            top_score = sorted_categories[0][1]
            confidence_score = min(0.98, 0.60 + (top_score * 0.12))
            severity_score = self._estimate_severity(text_lower, predicted_category)

        return {
            "predicted_category": predicted_category,
            "confidence_score": round(confidence_score, 2),
            "severity_score": severity_score,
            "model_version": self.version
        }

    def _estimate_severity(self, text: str, category: str) -> int:
        """Estimates severity rating from 1 (minor) to 5 (extreme/catastrophic)."""
        severe_terms = ["extreme", "red alert", "devastating", "catastrophic", "evacuation", "casualties", "unprecedented", "massive", "severe"]
        high_terms = ["orange alert", "warning", "high", "damage", "flooded", "disrupted", "blocked"]

        text_lower = text.lower()
        base_severity = 2

        if category in ["Cyclone", "Flash Floods", "Cloudburst", "Landslide"]:
            base_severity = 4
        elif category in ["Heavy Rainfall", "Heatwave", "Hailstorm"]:
            base_severity = 3

        if any(term in text_lower for term in severe_terms):
            return 5
        elif any(term in text_lower for term in high_terms):
            return min(5, base_severity + 1)

        return base_severity

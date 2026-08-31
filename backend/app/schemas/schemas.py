"""
Pydantic Schemas for API Requests, Responses, and Serialization.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import datetime


class UserLogin(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    name: str


class WeatherEventCreate(BaseModel):
    raw_text: str
    event_category: Optional[str] = None
    state: str
    district: str
    city: Optional[str] = None
    latitude: float
    longitude: float
    severity: Optional[int] = 1
    media_url: Optional[str] = None
    reporter_name: Optional[str] = "Anonymous Citizen"


class WeatherEventResponse(BaseModel):
    event_id: str
    source_id: str
    source_type: str
    source_name: Optional[str] = None
    source_url: Optional[str] = None
    author_name: Optional[str] = None
    timestamp: datetime.datetime
    raw_text: str
    event_category: str
    severity: int
    country: str
    state: str
    district: str
    city: Optional[str] = None
    latitude: float
    longitude: float
    location_confidence: float
    media_url: Optional[str] = None
    hashtags: List[str] = []
    weather_values: Dict[str, Any] = {}
    verification_status: str
    trust_score: float
    ai_confidence: float
    is_duplicate: bool
    duplicate_score: float
    parent_event_id: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class EventVerifyRequest(BaseModel):
    status: str  # VERIFIED, REJECTED, FLAGGED, DUPLICATE, UNDER_REVIEW
    reason: Optional[str] = None
    corrected_category: Optional[str] = None
    parent_event_id: Optional[str] = None


class MapGeoJSONFeature(BaseModel):
    type: str = "Feature"
    geometry: Dict[str, Any]
    properties: Dict[str, Any]


class MapGeoJSONCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[MapGeoJSONFeature]


class SourceConnectorSchema(BaseModel):
    source_id: str
    source_name: str
    source_type: str
    endpoint_url: Optional[str] = None
    polling_interval_sec: int
    is_active: bool
    health_status: str
    reliability_score: float
    last_fetched_at: datetime.datetime

    class Config:
        from_attributes = True


class HashtagCreate(BaseModel):
    hashtag: str
    category_mapping: Optional[str] = None


class AuditLogResponse(BaseModel):
    audit_id: str
    user_id: str
    user_name: str
    action: str
    entity_type: str
    entity_id: str
    old_value: Optional[Dict[str, Any]] = None
    new_value: Optional[Dict[str, Any]] = None
    ip_address: str
    timestamp: datetime.datetime

    class Config:
        from_attributes = True

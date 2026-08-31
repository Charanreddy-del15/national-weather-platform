"""
SQLAlchemy ORM Data Models for National Weather Platform.
Includes Unified Weather Event, Source Connector, Audit Log, User, System Alert, Hashtag Config.
"""

from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
import datetime
import uuid
from backend.app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="Analyst", nullable=False)  # Super Admin, Admin, Analyst, Verifier, Citizen
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class WeatherEvent(Base):
    __tablename__ = "weather_events"

    event_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    source_id = Column(String, index=True, nullable=False)
    source_type = Column(String, index=True, nullable=False)  # GOVT_API, RSS, PUBLIC_SOCIAL, CITIZEN, PROVIDER
    source_name = Column(String, nullable=True)
    source_url = Column(String, nullable=True)
    author_name = Column(String, nullable=True)

    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    ingestion_timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    raw_text = Column(Text, nullable=False)
    normalized_text = Column(Text, nullable=True)

    event_category = Column(String, index=True, nullable=False)  # Heavy Rainfall, Flood, Cyclone, etc.
    severity = Column(Integer, default=1, index=True)  # 1 to 5

    country = Column(String, default="India")
    state = Column(String, index=True, nullable=False)
    district = Column(String, index=True, nullable=False)
    city = Column(String, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    location_confidence = Column(Float, default=0.80)
    media_url = Column(String, nullable=True)
    hashtags = Column(JSON, default=list)
    weather_values = Column(JSON, default=dict)

    verification_status = Column(String, default="UNVERIFIED", index=True)  # UNVERIFIED, UNDER_REVIEW, VERIFIED, REJECTED, FLAGGED, DUPLICATE
    trust_score = Column(Float, default=0.50, index=True)
    ai_confidence = Column(Float, default=0.75)

    is_duplicate = Column(Boolean, default=False, index=True)
    duplicate_score = Column(Float, default=0.0)
    parent_event_id = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class SourceConnector(Base):
    __tablename__ = "sources"

    source_id = Column(String, primary_key=True)
    source_name = Column(String, nullable=False)
    source_type = Column(String, nullable=False)  # GOVT_API, RSS, PUBLIC_SOCIAL, CITIZEN, PROVIDER
    endpoint_url = Column(String, nullable=True)
    polling_interval_sec = Column(Integer, default=300)
    is_active = Column(Boolean, default=True)
    health_status = Column(String, default="HEALTHY")  # HEALTHY, DEGRADED, OFFLINE
    reliability_score = Column(Float, default=0.90)
    last_fetched_at = Column(DateTime, default=datetime.datetime.utcnow)


class HashtagConfig(Base):
    __tablename__ = "hashtags"

    id = Column(Integer, primary_key=True, autoincrement=True)
    hashtag = Column(String, unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
    category_mapping = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    audit_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    user_name = Column(String, nullable=False)
    action = Column(String, nullable=False)  # VERIFY_EVENT, REJECT_EVENT, EDIT_SOURCE, ADD_HASHTAG
    entity_type = Column(String, nullable=False)  # WeatherEvent, SourceConnector, HashtagConfig
    entity_id = Column(String, nullable=False)
    old_value = Column(JSON, nullable=True)
    new_value = Column(JSON, nullable=True)
    ip_address = Column(String, default="127.0.0.1")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)


class SystemAlert(Base):
    __tablename__ = "system_alerts"

    alert_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String, default="HIGH")  # CRITICAL, HIGH, MEDIUM, LOW
    state = Column(String, nullable=True)
    district = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

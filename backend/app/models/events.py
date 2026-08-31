from sqlalchemy import Column, String, Float, Integer, Boolean, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.db import Base

class WeatherEventModel(Base):
    __tablename__ = "weather_events"

    event_id = Column(String, primary_key=True, index=True)
    source_id = Column(String, nullable=False)
    source_type = Column(String, nullable=False)
    source_url = Column(String, nullable=True)
    author_name = Column(String, nullable=False)
    timestamp = Column(String, nullable=False, index=True)
    ingestion_timestamp = Column(String, nullable=False)
    
    raw_text = Column(Text, nullable=False)
    normalized_text = Column(Text, nullable=False)
    
    event_category = Column(String, nullable=False, index=True)
    event_subcategory = Column(String, nullable=True)
    severity = Column(Float, nullable=False)
    
    country = Column(String, default="India")
    state = Column(String, nullable=False, index=True)
    district = Column(String, nullable=False, index=True)
    city = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_confidence = Column(Float, nullable=False)
    
    media_type = Column(String, default="NONE")
    media_url = Column(String, nullable=True)
    hashtags = Column(JSON, nullable=False)
    weather_values = Column(JSON, nullable=False)
    
    verification_status = Column(String, nullable=False, index=True)
    verification_score = Column(Float, nullable=False)
    trust_score = Column(Float, nullable=False)
    
    ai_confidence = Column(Float, nullable=False)
    duplicate_score = Column(Float, default=0.0)
    is_duplicate = Column(Boolean, default=False)
    parent_event_id = Column(String, nullable=True)
    
    created_at = Column(String, default=datetime.utcnow().isoformat)
    updated_at = Column(String, default=datetime.utcnow().isoformat)

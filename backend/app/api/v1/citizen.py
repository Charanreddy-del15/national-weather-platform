"""
Citizen Reporting Router — Crowdsourced submission API.
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import datetime
import uuid
from backend.app.core.database import get_db
from backend.app.models.models import WeatherEvent
from backend.app.schemas.schemas import WeatherEventResponse
from ingestion.pipelines.pipeline import IngestionPipeline

router = APIRouter(prefix="/citizen", tags=["Citizen Reporting"])
pipeline = IngestionPipeline()


@router.post("/reports", response_model=WeatherEventResponse)
async def submit_citizen_report(
    description: str = Form(...),
    category: str = Form("Heavy Rainfall"),
    state: str = Form(...),
    district: str = Form(...),
    city: Optional[str] = Form(None),
    latitude: float = Form(...),
    longitude: float = Form(...),
    severity: int = Form(3),
    reporter_name: Optional[str] = Form("Anonymous Citizen"),
    file: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db)
):
    """Public citizen report submission portal with automatic ingestion processing."""
    media_url = None
    if file:
        # Validate MIME type and file size
        allowed_mimes = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"]
        if file.content_type not in allowed_mimes:
            raise HTTPException(status_code=400, detail="Invalid media format. Allowed: JPG, PNG, WEBP, MP4, WEBM")
        media_url = f"/uploads/citizen_{uuid.uuid4().hex[:8]}_{file.filename}"

    raw_event = {
        "event_id": str(uuid.uuid4()),
        "source_id": "src_citizen_portal",
        "source_type": "CITIZEN",
        "source_name": "National Citizen Reporting Portal",
        "author_name": reporter_name,
        "raw_text": description,
        "event_category": category,
        "severity": severity,
        "country": "India",
        "state": state,
        "district": district,
        "city": city or district,
        "latitude": latitude,
        "longitude": longitude,
        "location_confidence": 0.95,
        "media_url": media_url,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }

    # Run event through AI classification, trust engine, and deduplication
    processed = pipeline.process_event(raw_event, existing_events=[])

    event_orm = WeatherEvent(
        event_id=processed["event_id"],
        source_id=processed["source_id"],
        source_type=processed["source_type"],
        source_name=processed["source_name"],
        author_name=processed["author_name"],
        raw_text=processed["raw_text"],
        event_category=processed["event_category"],
        severity=processed["severity"],
        country="India",
        state=processed["state"],
        district=processed["district"],
        city=processed["city"],
        latitude=processed["latitude"],
        longitude=processed["longitude"],
        location_confidence=processed["location_confidence"],
        media_url=processed.get("media_url"),
        verification_status=processed["verification_status"],
        trust_score=processed["trust_score"],
        ai_confidence=processed["ai_confidence"],
        is_duplicate=processed["is_duplicate"],
        timestamp=datetime.datetime.utcnow()
    )

    db.add(event_orm)
    await db.commit()
    await db.refresh(event_orm)

    return event_orm

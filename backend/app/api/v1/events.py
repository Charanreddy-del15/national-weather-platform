"""
Events Router — CRUD, Map Bounding Box Queries, and Verification API.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from typing import List, Optional
import datetime
from backend.app.core.database import get_db
from backend.app.models.models import WeatherEvent, AuditLog
from backend.app.schemas.schemas import WeatherEventResponse, EventVerifyRequest, MapGeoJSONCollection, MapGeoJSONFeature
from backend.app.core.security import get_current_user, require_role

router = APIRouter(prefix="/events", tags=["Weather Events"])


@router.get("", response_model=List[WeatherEventResponse])
async def list_events(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=500),
    state: Optional[str] = None,
    district: Optional[str] = None,
    category: Optional[str] = None,
    verification_status: Optional[str] = None,
    source_type: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Paginated list of weather events with dynamic criteria filtering."""
    query = select(WeatherEvent)

    filters = []
    if state:
        filters.append(WeatherEvent.state.ilike(f"%{state}%"))
    if district:
        filters.append(WeatherEvent.district.ilike(f"%{district}%"))
    if category:
        filters.append(WeatherEvent.event_category == category)
    if verification_status:
        filters.append(WeatherEvent.verification_status == verification_status)
    if source_type:
        filters.append(WeatherEvent.source_type == source_type)
    if search:
        search_fmt = f"%{search}%"
        filters.append(or_(
            WeatherEvent.raw_text.ilike(search_fmt),
            WeatherEvent.city.ilike(search_fmt),
            WeatherEvent.district.ilike(search_fmt),
            WeatherEvent.state.ilike(search_fmt),
            WeatherEvent.event_category.ilike(search_fmt)
        ))

    if filters:
        query = query.where(and_(*filters))

    offset = (page - 1) * limit
    query = query.order_by(WeatherEvent.timestamp.desc()).offset(offset).limit(limit)

    result = await db.execute(query)
    events = result.scalars().all()
    return events


@router.get("/map", response_model=MapGeoJSONCollection)
async def get_map_geojson(
    min_lat: Optional[float] = Query(6.0),
    max_lat: Optional[float] = Query(38.0),
    min_lng: Optional[float] = Query(68.0),
    max_lng: Optional[float] = Query(98.0),
    category: Optional[str] = None,
    verification_status: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Returns spatial GeoJSON FeatureCollection optimized for Leaflet map markers."""
    query = select(WeatherEvent).where(
        and_(
            WeatherEvent.latitude >= min_lat,
            WeatherEvent.latitude <= max_lat,
            WeatherEvent.longitude >= min_lng,
            WeatherEvent.longitude <= max_lng
        )
    )

    if category:
        query = query.where(WeatherEvent.event_category == category)
    if verification_status:
        query = query.where(WeatherEvent.verification_status == verification_status)

    result = await db.execute(query.order_by(WeatherEvent.timestamp.desc()).limit(1000))
    events = result.scalars().all()

    features = []
    for evt in events:
        features.append(MapGeoJSONFeature(
            type="Feature",
            geometry={
                "type": "Point",
                "coordinates": [evt.longitude, evt.latitude]
            },
            properties={
                "event_id": evt.event_id,
                "event_category": evt.event_category,
                "severity": evt.severity,
                "state": evt.state,
                "district": evt.district,
                "city": evt.city,
                "raw_text": evt.raw_text,
                "source_type": evt.source_type,
                "trust_score": evt.trust_score,
                "verification_status": evt.verification_status,
                "is_duplicate": evt.is_duplicate,
                "timestamp": evt.timestamp.isoformat() if evt.timestamp else None
            }
        ))

    return MapGeoJSONCollection(type="FeatureCollection", features=features)


@router.get("/{event_id}", response_model=WeatherEventResponse)
async def get_event_detail(event_id: str, db: AsyncSession = Depends(get_db)):
    """Fetch single event by ID."""
    result = await db.execute(select(WeatherEvent).where(WeatherEvent.event_id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Weather event not found")
    return event


@router.post("/{event_id}/verify", response_model=WeatherEventResponse)
async def verify_event(
    event_id: str,
    body: EventVerifyRequest,
    current_user: dict = Depends(require_role(["Super Admin", "Admin", "Verifier"])),
    db: AsyncSession = Depends(get_db)
):
    """Admin/Verifier moderation endpoint to update verification status and generate audit log."""
    result = await db.execute(select(WeatherEvent).where(WeatherEvent.event_id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Weather event not found")

    old_status = event.verification_status
    event.verification_status = body.status

    if body.corrected_category:
        event.event_category = body.corrected_category
    if body.parent_event_id:
        event.is_duplicate = True
        event.parent_event_id = body.parent_event_id

    # Create immutable Audit Log
    audit = AuditLog(
        user_id=current_user.get("sub", "usr_admin"),
        user_name=current_user.get("name", "Admin Verifier"),
        action=f"MODERATE_EVENT_{body.status}",
        entity_type="WeatherEvent",
        entity_id=event_id,
        old_value={"verification_status": old_status},
        new_value={"verification_status": body.status, "reason": body.reason}
    )
    db.add(audit)
    await db.commit()
    await db.refresh(event)

    return event

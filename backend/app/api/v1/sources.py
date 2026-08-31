"""
Sources Router — Connector management & provider health monitoring API.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from backend.app.core.database import get_db
from backend.app.models.models import SourceConnector
from backend.app.schemas.schemas import SourceConnectorSchema
from backend.app.core.security import require_role

router = APIRouter(prefix="/sources", tags=["Source Connectors"])


@router.get("", response_model=List[SourceConnectorSchema])
async def list_sources(db: AsyncSession = Depends(get_db)):
    """Fetch all configured ingestion sources and health metrics."""
    result = await db.execute(select(SourceConnector))
    sources = result.scalars().all()
    return sources


@router.patch("/{source_id}/toggle", response_model=SourceConnectorSchema)
async def toggle_source(
    source_id: str,
    current_user: dict = Depends(require_role(["Super Admin", "Admin"])),
    db: AsyncSession = Depends(get_db)
):
    """Enable/Disable an ingestion source connector."""
    result = await db.execute(select(SourceConnector).where(SourceConnector.source_id == source_id))
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=404, detail="Source connector not found")

    source.is_active = not source.is_active
    await db.commit()
    await db.refresh(source)
    return source

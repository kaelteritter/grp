from fastapi import APIRouter, Query, status
from typing import List, Optional

from app.core.database import SessionDep
from app.schemas.event import EventCreateSchema, EventReadSchema, EventUpdateSchema
from app import services


router = APIRouter(prefix="/events", tags=["events"])


@router.post("/", response_model=EventReadSchema, status_code=status.HTTP_201_CREATED)
async def create_event(
    db: SessionDep,
    event_in: EventCreateSchema
):
    return await services.create_event(db, event_in)


@router.get("/", response_model=List[EventReadSchema])
async def read_events(
    db: SessionDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    return await services.read_events(db, skip=skip, limit=limit)


@router.get("/{event_id}", response_model=EventReadSchema)
async def read_event(
    db: SessionDep,
    event_id: int
):
    return await services.read_event(db, event_id)


@router.patch("/{event_id}", response_model=EventReadSchema)
async def update_event(
    db: SessionDep,
    event_id: int,
    event_in: EventUpdateSchema
):
    return await services.update_event(db, event_id, event_in)


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    db: SessionDep,
    event_id: int
):
    await services.delete_event(db, event_id)
    return None
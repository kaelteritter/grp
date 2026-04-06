from fastapi import APIRouter, Query, status
from typing import List, Optional

from app import services
from app.core.database import SessionDep
from app.schemas.location import LocationCreateSchema, LocationReadSchema, LocationUpdateSchema


router = APIRouter(prefix="/locations", tags=["locations"])


def enrich_location_with_region(location):
    """Обогащает локацию данными о регионе и стране"""
    # Pydantic сам обработает вложенные объекты благодаря from_attributes=True
    return LocationReadSchema.model_validate(location, from_attributes=True)


@router.post("/", response_model=LocationReadSchema, status_code=status.HTTP_201_CREATED)
async def create_location(
    db: SessionDep,
    location_in: LocationCreateSchema
):
    """
    Создать новую локацию
    """
    location = await services.create_location(db, location_in)
    return enrich_location_with_region(location)


@router.get("/", response_model=List[LocationReadSchema], status_code=status.HTTP_200_OK)
async def read_locations(
    db: SessionDep,
    region_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None, description="Поиск по названию"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100)
):
    """
    Получить список локаций с фильтрацией по региону
    """
    locations = await services.read_locations(db, region_id=region_id, search=search, skip=skip, limit=limit)
    return [enrich_location_with_region(location) for location in locations]


@router.get("/{location_id}", response_model=LocationReadSchema, status_code=status.HTTP_200_OK)
async def read_location(
    db: SessionDep,
    location_id: int
):
    """
    Получить локацию по ID
    """
    location = await services.read_location(db, location_id)
    return enrich_location_with_region(location)


@router.patch("/{location_id}", response_model=LocationReadSchema, status_code=status.HTTP_200_OK)
async def update_location(
    db: SessionDep,
    location_id: int,
    location_in: LocationUpdateSchema
):
    """
    Обновить локацию
    """
    location = await services.update_location(db, location_id, location_in)
    return enrich_location_with_region(location)


@router.delete("/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_location(
    db: SessionDep,
    location_id: int
):
    """
    Удалить локацию
    """
    await services.delete_location(db, location_id)
    return None
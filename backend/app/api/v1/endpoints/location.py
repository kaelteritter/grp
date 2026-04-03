# backend/app/api/v1/endpoints/location.py:

from fastapi import APIRouter, Query, status
from typing import List, Optional

from app import services
from app.core.database import SessionDep
from app.schemas.location import LocationCreateSchema, LocationReadSchema, LocationUpdateSchema


router = APIRouter(prefix="/locations", tags=["locations"])


def enrich_location_with_region_name(location):
    """Добавляет название региона в ответ"""
    result = LocationReadSchema.model_validate(location, from_attributes=True)
    if location.region:
        result.region_name = location.region.name
        if location.region.country:
            result.country_id = location.region.country.id
            result.country_name = location.region.country.name
    return result


@router.post("/", response_model=LocationReadSchema, status_code=status.HTTP_201_CREATED)
async def create_location(
    db: SessionDep,
    location_in: LocationCreateSchema
):
    """
    Создать новую локацию
    """
    location = await services.create_location(db, location_in)
    return enrich_location_with_region_name(location)


@router.get("/", response_model=List[LocationReadSchema], status_code=status.HTTP_200_OK)
async def read_locations(
    db: SessionDep,
    region_id: Optional[int] = Query(None, description="Фильтр по ID региона"),
    skip: int = Query(0, ge=0, description="Пропустить записей"),
    limit: int = Query(100, ge=1, le=1000, description="Лимит записей")
):
    """
    Получить список локаций с фильтрацией по региону
    """
    locations = await services.read_locations(db, region_id=region_id, skip=skip, limit=limit)
    return [enrich_location_with_region_name(location) for location in locations]


@router.get("/{location_id}", response_model=LocationReadSchema, status_code=status.HTTP_200_OK)
async def read_location(
    db: SessionDep,
    location_id: int
):
    """
    Получить локацию по ID
    """
    location = await services.read_location(db, location_id)
    return enrich_location_with_region_name(location)


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
    return enrich_location_with_region_name(location)


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
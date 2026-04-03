# backend/app/api/v1/endpoints/region.py

from fastapi import APIRouter, Query, status
from typing import List, Optional

from app import services
from app.core.database import SessionDep
from app.schemas.region import RegionCreateSchema, RegionReadSchema, RegionUpdateSchema


router = APIRouter(prefix="/regions", tags=["regions"])


def enrich_region_with_country_name(region):
    """Добавляет название страны в ответ"""
    return RegionReadSchema.model_validate(region, from_attributes=True)
    if region.country:
        result.country_name = region.country.name
    return result


@router.post("/", response_model=RegionReadSchema, status_code=status.HTTP_201_CREATED)
async def create_region(
    db: SessionDep,
    region_in: RegionCreateSchema
):
    """
    Создать новый регион
    """
    region = await services.create_region(db, region_in)
    return enrich_region_with_country_name(region)


@router.get("/", response_model=List[RegionReadSchema], status_code=status.HTTP_200_OK)
async def read_regions(
    db: SessionDep,
    country_id: Optional[int] = Query(None, description="Фильтр по ID страны"),
    skip: int = Query(0, ge=0, description="Пропустить записей"),
    limit: int = Query(100, ge=1, le=1000, description="Лимит записей")
):
    """
    Получить список регионов с фильтрацией по стране
    """
    regions = await services.read_regions(db, country_id=country_id, skip=skip, limit=limit)
    return [enrich_region_with_country_name(region) for region in regions]


@router.get("/{region_id}", response_model=RegionReadSchema, status_code=status.HTTP_200_OK)
async def read_region(
    db: SessionDep,
    region_id: int
):
    """
    Получить регион по ID
    """
    region = await services.read_region(db, region_id)
    return enrich_region_with_country_name(region)


@router.patch("/{region_id}", response_model=RegionReadSchema, status_code=status.HTTP_200_OK)
async def update_region(
    db: SessionDep,
    region_id: int,
    region_in: RegionUpdateSchema
):
    """
    Обновить регион
    """
    region = await services.update_region(db, region_id, region_in)
    return enrich_region_with_country_name(region)


@router.delete("/{region_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_region(
    db: SessionDep,
    region_id: int
):
    """
    Удалить регион
    """
    await services.delete_region(db, region_id)
    return None
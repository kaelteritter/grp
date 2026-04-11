# backend/app/api/v1/endpoints/region.py

from fastapi import APIRouter, Query, status
from typing import List, Optional

from app import services
from app.core.database import SessionDep
from app.schemas.region import RegionCreateSchema, RegionReadSchema, RegionUpdateSchema


router = APIRouter(prefix="/regions", tags=["regions"])



@router.post("/", response_model=RegionReadSchema, status_code=status.HTTP_201_CREATED)
async def create_region(
    db: SessionDep,
    region_in: RegionCreateSchema
):
    """
    Создать новый регион
    """
    return await services.create_region(db, region_in)


@router.get("/", response_model=List[RegionReadSchema], status_code=status.HTTP_200_OK)
async def read_regions(
    db: SessionDep,
    country_id: Optional[int] = Query(None, description="Фильтр по ID страны"),
    search: Optional[str] = Query(None, description="Поиск по названию"),
    skip: int = Query(0, ge=0, description="Пропустить записей"),
    limit: int = Query(100, ge=1, le=1000, description="Лимит записей")
):
    """
    Получить список регионов с фильтрацией по стране
    """
    return await services.read_regions(db, country_id=country_id, skip=skip, limit=limit, search=search)
    


@router.get("/{region_id}", response_model=RegionReadSchema, status_code=status.HTTP_200_OK)
async def read_region(
    db: SessionDep,
    region_id: int
):
    """
    Получить регион по ID
    """
    return await services.read_region(db, region_id)


@router.patch("/{region_id}", response_model=RegionReadSchema, status_code=status.HTTP_200_OK)
async def update_region(
    db: SessionDep,
    region_id: int,
    region_in: RegionUpdateSchema
):
    """
    Обновить регион
    """
    return await services.update_region(db, region_id, region_in)


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
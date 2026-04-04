from fastapi import APIRouter, Query, status
from typing import List, Optional

from app.core.database import SessionDep
from app.schemas.address import AddressCreateSchema, AddressReadSchema, AddressUpdateSchema
from app import services


router = APIRouter(prefix="/addresses", tags=["addresses"])


def enrich_address(address):
    """Преобразует модель Address в Pydantic схему"""
    return AddressReadSchema.model_validate(address, from_attributes=True)


@router.post("/", response_model=AddressReadSchema, status_code=status.HTTP_201_CREATED)
async def create_address(
    db: SessionDep,
    address_in: AddressCreateSchema
):
    """
    Создать новый адрес
    """
    address = await services.create_address(db, address_in)
    return enrich_address(address)


@router.get("/", response_model=List[AddressReadSchema])
async def read_addresses(
    db: SessionDep,
    location_id: Optional[int] = Query(None, description="Фильтр по ID локации"),
    skip: int = Query(0, ge=0, description="Пропустить записей"),
    limit: int = Query(100, ge=1, le=1000, description="Лимит записей")
):
    """
    Получить список адресов с фильтрацией по локации
    """
    addresses = await services.read_addresses(db, location_id=location_id, skip=skip, limit=limit)
    return [enrich_address(address) for address in addresses]


@router.get("/{address_id}", response_model=AddressReadSchema)
async def read_address(
    db: SessionDep,
    address_id: int
):
    """
    Получить адрес по ID
    """
    address = await services.read_address(db, address_id)
    return enrich_address(address)


@router.patch("/{address_id}", response_model=AddressReadSchema)
async def update_address(
    db: SessionDep,
    address_id: int,
    address_in: AddressUpdateSchema
):
    """
    Обновить адрес
    """
    address = await services.update_address(db, address_id, address_in)
    return enrich_address(address)


@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_address(
    db: SessionDep,
    address_id: int
):
    """
    Удалить адрес
    """
    await services.delete_address(db, address_id)
    return None
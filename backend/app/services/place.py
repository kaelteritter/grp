import logging
from typing import Optional
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.models.place import Place
from app.models.address import Address
from app.models.location import Location
from app.models.region import Region
from app.models.country import Country
from app.schemas.place import PlaceCreateSchema, PlaceUpdateSchema
from app.services.address import read_address

logger = logging.getLogger(__name__)


async def read_place(db: AsyncSession, place_id: int):
    stmt = (
        select(Place)
        .where(Place.id == place_id)
        .options(
            selectinload(Place.address)
            .selectinload(Address.location)
            .selectinload(Location.region)
            .selectinload(Region.country)
        )
    )
    result = await db.execute(stmt)
    place = result.scalar_one_or_none()
    if not place:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Место не найдено")
    return place


async def create_place(db: AsyncSession, place_in: PlaceCreateSchema):
    try:
        # Проверяем существование адреса
        await read_address(db, place_in.address_id)
        
        # Проверяем уникальность имени в пределах адреса
        stmt = select(Place).where(
            Place.name == place_in.name,
            Place.address_id == place_in.address_id
        )
        result = await db.execute(stmt)
        existing = result.scalar_one_or_none()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Место с названием '{place_in.name}' по этому адресу уже существует"
            )
        
        place = Place(**place_in.model_dump())
        db.add(place)
        await db.commit()
        await db.refresh(place)
        
        # Подгружаем связи для ответа
        stmt = (
            select(Place)
            .where(Place.id == place.id)
            .options(
                selectinload(Place.address)
                .selectinload(Address.location)
                .selectinload(Location.region)
                .selectinload(Region.country)
            )
        )
        result = await db.execute(stmt)
        place = result.scalar_one()
        return place
        
    except IntegrityError as e:
        await db.rollback()
        logger.error(f"IntegrityError при создании места: {e}")
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ошибка при создании места")
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in create_place: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ошибка при создании места")


async def read_places(
    db: AsyncSession,
    address_id: Optional[int] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    stmt = (
        select(Place)
        .options(
            selectinload(Place.address)
            .selectinload(Address.location)
            .selectinload(Location.region)
            .selectinload(Region.country)
        )
    )
    if address_id:
        stmt = stmt.where(Place.address_id == address_id)
    if search:
        stmt = stmt.where(Place.name.ilike(f"%{search}%"))
    stmt = stmt.order_by(Place.name).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()


async def update_place(db: AsyncSession, place_id: int, place_in: PlaceUpdateSchema):
    try:
        place = await read_place(db, place_id)  # уже подгружает связи
        
        update_data = place_in.model_dump(exclude_unset=True)
        
        if "address_id" in update_data and update_data["address_id"] is not None:
            await read_address(db, update_data["address_id"])
        
        for field, value in update_data.items():
            setattr(place, field, value)
        
        await db.commit()
        await db.refresh(place)
        
        # Перезагружаем связи
        stmt = (
            select(Place)
            .where(Place.id == place_id)
            .options(
                selectinload(Place.address)
                .selectinload(Address.location)
                .selectinload(Location.region)
                .selectinload(Region.country)
            )
        )
        result = await db.execute(stmt)
        place = result.scalar_one()
        return place
        
    except IntegrityError as e:
        await db.rollback()
        logger.error(f"IntegrityError при обновлении места: {e}")
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ошибка при обновлении места")
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in update_place: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ошибка при обновлении места")


async def delete_place(db: AsyncSession, place_id: int):
    place = await read_place(db, place_id)
    await db.delete(place)
    await db.commit()
    return {"ok": True}
# backend/app/services/location.py

import logging
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.location import Location
from app.models.region import Region
from app.schemas.location import LocationCreateSchema, LocationUpdateSchema

logger = logging.getLogger(__name__)


async def create_location(db: AsyncSession, location_in: LocationCreateSchema):
    """Создание локации с проверкой существования региона"""
    try:
        # Проверяем, существует ли регион (если указан)
        if location_in.region_id:
            stmt = select(Region).where(Region.id == location_in.region_id)
            result = await db.execute(stmt)
            region = result.scalar_one_or_none()
            
            if not region:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Регион с ID {location_in.region_id} не найден"
                )
        
        # Проверяем уникальность названия в пределах региона
        # (в одном регионе не может быть двух локаций с одинаковым названием)
        if location_in.region_id:
            stmt = select(Location).where(
                Location.name == location_in.name,
                Location.region_id == location_in.region_id
            )
            result = await db.execute(stmt)
            existing = result.scalar_one_or_none()
            
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Локация с названием '{location_in.name}' уже существует в этом регионе"
                )
        
        location = Location(**location_in.model_dump())
        db.add(location)
        await db.commit()
        await db.refresh(location)
        return location
        
    except IntegrityError as e:
        await db.rollback()
        logger.error(f"IntegrityError in create_location: {e}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ошибка при создании локации"
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in create_location: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ошибка при создании локации"
        )


async def read_location(db: AsyncSession, location_id: int):
    """Получение локации по ID с подгрузкой региона"""
    stmt = (
        select(Location)
        .where(Location.id == location_id)
        .options(
            selectinload(Location.region).selectinload(Region.country)
        )
    )
    result = await db.execute(stmt)
    location = result.scalar_one_or_none()

    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Локация не найдена"
        )
    
    return location


async def read_locations(
    db: AsyncSession, 
    region_id: Optional[int] = None,
    skip: int = 0, 
    limit: int = 100
):
    """Получение списка локаций с фильтрацией по региону"""
    stmt = select(Location).options(
        selectinload(Location.region).selectinload(Region.country)
    )
    
    if region_id:
        stmt = stmt.where(Location.region_id == region_id)
    
    stmt = stmt.order_by(Location.name).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()


async def update_location(
    db: AsyncSession, 
    location_id: int, 
    location_in: LocationUpdateSchema
):
    """Обновление локации с проверкой связей"""
    try:
        # Проверяем, существует ли локация и подгружаем ее
        stmt = select(Location).where(Location.id == location_id).options(
            selectinload(Location.region).selectinload(Region.country)
        )
        result = await db.execute(stmt)
        location = result.scalar_one_or_none()

        if not location:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Локация не найдена"
            )
        
        update_data = location_in.model_dump(exclude_unset=True)
        
        # Определяем, какой регион будет после обновления
        new_region_id = update_data.get("region_id", location.region_id)
        new_name = update_data.get("name", location.name)
        
        # Проверяем существование нового региона (если меняется)
        if "region_id" in update_data and update_data["region_id"] is not None:
            stmt = select(Region).where(Region.id == update_data["region_id"])
            result = await db.execute(stmt)
            region = result.scalar_one_or_none()
            
            if not region:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Регион с ID {update_data['region_id']} не найден"
                )
        
        # Проверяем уникальность названия в целевом регионе
        # (если меняется имя ИЛИ регион, и регион не NULL)
        if new_region_id is not None:
            name_changed = "name" in update_data
            region_changed = "region_id" in update_data
            
            if name_changed or region_changed:
                stmt = select(Location).where(
                    Location.name == new_name,
                    Location.region_id == new_region_id,
                    Location.id != location_id
                )
                result = await db.execute(stmt)
                existing = result.scalar_one_or_none()
                
                if existing:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail=f"Локация с названием '{new_name}' уже существует в этом регионе"
                    )
        
        # Применяем обновления
        for field, value in update_data.items():
            setattr(location, field, value)
        
        await db.commit()
        await db.refresh(location)
        
        # Подгружаем обновленные связи
        stmt = select(Location).where(Location.id == location_id).options(
            selectinload(Location.region).selectinload(Region.country)
        )
        result = await db.execute(stmt)
        location = result.scalar_one()
        
        return location
        
    except IntegrityError as e:
        await db.rollback()
        logger.error(f"IntegrityError in update_location: {e}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ошибка при обновлении локации"
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in update_location: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ошибка при обновлении локации"
        )

async def delete_location(db: AsyncSession, location_id: int):
    """Удаление локации"""
    stmt = select(Location).where(Location.id == location_id)
    result = await db.execute(stmt)
    location = result.scalar_one_or_none()

    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Локация не найдена"
        )
    
    await db.delete(location)
    await db.commit()
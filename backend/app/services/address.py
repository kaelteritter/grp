import logging
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.address import Address
from app.models.location import Location
from app.models.region import Region
from app.models.country import Country
from app.schemas.address import AddressCreateSchema, AddressUpdateSchema

logger = logging.getLogger(__name__)


async def create_address(db: AsyncSession, address_in: AddressCreateSchema):
    """Создание адреса"""
    try:
        # Проверяем существование локации (если указана)
        if address_in.location_id:
            stmt = select(Location).where(Location.id == address_in.location_id)
            result = await db.execute(stmt)
            location = result.scalar_one_or_none()
            
            if not location:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Локация с ID {address_in.location_id} не найдена"
                )
        
        address = Address(**address_in.model_dump())
        db.add(address)
        await db.commit()
        await db.refresh(address)
        
        # Подгружаем связанные данные - правильный путь вложенности
        stmt = select(Address).where(Address.id == address.id).options(
            selectinload(Address.location).selectinload(Location.region).selectinload(Region.country)
        )
        result = await db.execute(stmt)
        address = result.scalar_one()
        
        return address
        
    except IntegrityError as e:
        await db.rollback()
        logger.error(f"IntegrityError in create_address: {e}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ошибка целостности данных при создании адреса"
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in create_address: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка при создании адреса: {str(e)}"
        )


async def read_address(db: AsyncSession, address_id: int):
    """Получение адреса по ID"""
    stmt = select(Address).where(Address.id == address_id).options(
        selectinload(Address.location).selectinload(Location.region).selectinload(Region.country)
    )
    result = await db.execute(stmt)
    address = result.scalar_one_or_none()

    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Адрес не найден"
        )
    
    return address


async def read_addresses(
    db: AsyncSession,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    """Получение списка адресов с фильтрацией по локации"""
    stmt = select(Address).options(
        selectinload(Address.location).selectinload(Location.region).selectinload(Region.country)
    )
    
    if search:
            stmt = stmt.where(
                or_(
                    Address.street.ilike(f"%{search}%"),
                    Address.house.ilike(f"%{search}%")
                )
            )
    
    stmt = stmt.order_by(Address.id).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()


async def update_address(
    db: AsyncSession,
    address_id: int,
    address_in: AddressUpdateSchema
):
    """Обновление адреса"""
    try:
        address = await read_address(db, address_id)
        
        update_data = address_in.model_dump(exclude_unset=True)
        
        # Проверяем существование локации (если меняется)
        if "location_id" in update_data and update_data["location_id"] is not None:
            stmt = select(Location).where(Location.id == update_data["location_id"])
            result = await db.execute(stmt)
            location = result.scalar_one_or_none()
            
            if not location:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Локация с ID {update_data['location_id']} не найдена"
                )
        
        for field, value in update_data.items():
            setattr(address, field, value)
        
        await db.commit()
        await db.refresh(address)
        
        # Подгружаем связанные данные
        stmt = select(Address).where(Address.id == address_id).options(
            selectinload(Address.location).selectinload(Location.region).selectinload(Region.country)
        )
        result = await db.execute(stmt)
        address = result.scalar_one()
        
        return address
        
    except IntegrityError as e:
        await db.rollback()
        logger.error(f"IntegrityError in update_address: {e}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ошибка целостности данных при обновлении адреса"
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in update_address: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка при обновлении адреса: {str(e)}"
        )


async def delete_address(db: AsyncSession, address_id: int):
    """Удаление адреса"""
    address = await read_address(db, address_id)
    
    await db.delete(address)
    await db.commit()
    
    return {"ok": True}
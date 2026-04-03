import logging
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.region import Region
from app.models.country import Country
from app.schemas.region import RegionCreateSchema, RegionUpdateSchema

logger = logging.getLogger(__name__)


async def create_region(db: AsyncSession, region_in: RegionCreateSchema):
    """Создание региона с проверкой существования страны"""
    try:
        # Проверяем, существует ли страна (если указана)
        if region_in.country_id:
            stmt = select(Country).where(Country.id == region_in.country_id)
            result = await db.execute(stmt)
            country = result.scalar_one_or_none()
            
            if not country:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Страна с ID {region_in.country_id} не найдена"
                )
        
        # Проверяем, существует ли регион с таким именем
        stmt = select(Region).where(Region.name == region_in.name)
        result = await db.execute(stmt)
        existing = result.scalar_one_or_none()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Регион с названием '{region_in.name}' уже существует"
            )
        
        region = Region(**region_in.model_dump())
        db.add(region)
        await db.commit()
        await db.refresh(region)
        return region
        
    except IntegrityError as e:
        await db.rollback()
        logger.error(f"IntegrityError in create_region: {e}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Регион с названием '{region_in.name}' уже существует"
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in create_region: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ошибка при создании региона"
        )


async def read_region(db: AsyncSession, region_id: int):
    """Получение региона по ID с подгрузкой страны"""
    stmt = select(Region).where(Region.id == region_id).options(selectinload(Region.country))
    result = await db.execute(stmt)
    region = result.scalar_one_or_none()

    if not region:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Регион не найден"
        )
    
    return region


async def read_regions(
    db: AsyncSession, 
    country_id: int = None,
    skip: int = 0, 
    limit: int = 100
):
    """Получение списка регионов с фильтрацией по стране"""
    stmt = select(Region).options(selectinload(Region.country))
    
    if country_id:
        stmt = stmt.where(Region.country_id == country_id)
    
    stmt = stmt.order_by(Region.name).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()


async def update_region(
    db: AsyncSession, 
    region_id: int, 
    region_in: RegionUpdateSchema
):
    """Обновление региона с проверкой связей"""
    try:
        # Проверяем, существует ли регион
        stmt = select(Region).where(Region.id == region_id)
        result = await db.execute(stmt)
        region = result.scalar_one_or_none()

        if not region:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Регион не найден"
            )
        
        update_data = region_in.model_dump(exclude_unset=True)
        
        # Проверяем существование страны (если меняется)
        if update_data.get("country_id"):
            stmt = select(Country).where(Country.id == update_data["country_id"])
            result = await db.execute(stmt)
            country = result.scalar_one_or_none()
            
            if not country:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Страна с ID {update_data['country_id']} не найдена"
                )
        
        # Проверяем уникальность имени (если меняется)
        if update_data.get("name"):
            stmt = select(Region).where(
                Region.name == update_data["name"],
                Region.id != region_id
            )
            result = await db.execute(stmt)
            existing = result.scalar_one_or_none()
            
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Регион с названием '{update_data['name']}' уже существует"
                )
        
        for field, value in update_data.items():
            setattr(region, field, value)
        
        await db.commit()
        await db.refresh(region)
        
        # Подгружаем страну для ответа
        stmt = select(Region).where(Region.id == region_id).options(selectinload(Region.country))
        result = await db.execute(stmt)
        region = result.scalar_one()
        
        return region
        
    except IntegrityError as e:
        await db.rollback()
        logger.error(f"IntegrityError in update_region: {e}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Регион с таким названием уже существует"
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in update_region: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ошибка при обновлении региона"
        )


async def delete_region(db: AsyncSession, region_id: int):
    """Удаление региона"""
    stmt = select(Region).where(Region.id == region_id)
    result = await db.execute(stmt)
    region = result.scalar_one_or_none()

    if not region:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Регион не найден"
        )
    
    await db.delete(region)
    await db.commit()
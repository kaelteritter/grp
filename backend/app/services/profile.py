import logging
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import IntegrityError

from app.models.address import Address
from app.models.photo import Photo
from app.models.place import Place
from app.models.platform import Platform
from app.models.profile import Profile, ProfileConnection
from app.models.location import Location
from app.models.region import Region
from app.models.link import Link
from app.models.profession import Profession
from app.schemas.profile import ProfileCreateSchema, ProfileUpdateSchema, ProfileReadSchema

logger = logging.getLogger(__name__)


async def create_profile(db: AsyncSession, profile_in: ProfileCreateSchema):
    """Создание профиля"""
    try:
        if profile_in.current_location_id:
            stmt = select(Location).where(Location.id == profile_in.current_location_id)
            result = await db.execute(stmt)
            location = result.scalar_one_or_none()
            if not location:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Локация с ID {profile_in.current_location_id} не найдена"
                )
            
        if profile_in.university_id:
            stmt = select(Place).where(Place.id == profile_in.university_id)
            result = await db.execute(stmt)
            if not result.scalar_one_or_none():
                raise HTTPException(404, detail=f"Университет с ID {profile_in.university_id} не найден")
        
        profile = Profile(**profile_in.model_dump())
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
        
        return profile
        
    except IntegrityError as e:
        await db.rollback()
        if "UNIQUE constraint failed: profiles.email" in str(e):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Профиль с таким email уже существует"
            )
        logger.error(f"IntegrityError in create_profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ошибка целостности данных при создании профиля"
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in create_profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка при создании профиля: {str(e)}"
        )


async def read_profile(db: AsyncSession, profile_id: int) -> ProfileReadSchema:
    """Получение профиля по ID с подгрузкой всех связей"""
    stmt = (
        select(Profile)
        .where(Profile.id == profile_id)
        .options(
            selectinload(Profile.university)
            .selectinload(Place.address)
            .selectinload(Address.location)
            .selectinload(Location.region)
            .selectinload(Region.country),
            selectinload(Profile.current_location)
            .selectinload(Location.region)
            .selectinload(Region.country),
            selectinload(Profile.professions),
            selectinload(Profile.links)
            .selectinload(Link.platform),
            selectinload(Profile.photos),
            selectinload(Profile.videos),
            selectinload(Profile.connections)
            .selectinload(ProfileConnection.connected_profile)
        )
    )
    
    result = await db.execute(stmt)
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Профиль не найден"
        )
    
    from sqlalchemy.inspection import inspect

    for conn in profile.connections:
        insp = inspect(conn)
        if "connected_profile" in insp.unloaded:
            logger.warning(f"⚠️ connected_profile НЕ загружен для связи {conn.id}")
    
    return profile


async def read_profiles(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
    cloth_ids: Optional[List[int]] = None,
    search: Optional[str] = None
):
    try:
        stmt = select(Profile).options(
            selectinload(Profile.current_location)
                .selectinload(Location.region)
                .selectinload(Region.country),
            selectinload(Profile.links)
                .selectinload(Link.platform),
            selectinload(Profile.photos),
            selectinload(Profile.videos),
            selectinload(Profile.professions),
            selectinload(Profile.university)
                .selectinload(Place.address)
                .selectinload(Address.location)
                .selectinload(Location.region)
                .selectinload(Region.country),
            selectinload(Profile.connections)
                .selectinload(ProfileConnection.connected_profile)
                .selectinload(Profile.photos)
        )

        if cloth_ids:
            stmt = stmt.where(Profile.photos.any(Photo.clothes.in_(cloth_ids)))

        if search:
            search_term = f"%{search}%"
            conditions = [
                Profile.first_name.ilike(search_term),
                Profile.middle_name.ilike(search_term),
                Profile.last_name.ilike(search_term),
                Profile.email.ilike(search_term),
                Profile.phone.ilike(search_term),
                Profile.current_location.has(Location.name.ilike(search_term)),  # поиск по локации
                Profile.professions.any(Profession.name.ilike(search_term)),   # поиск по профессии
                Profile.links.any(Link.platform.has(Platform.name.ilike(search_term))),  # поиск по платформе
                Profile.links.any(Link.url.ilike(search_term)),  # поиск по URL ссылки
            ]
            stmt = stmt.where(or_(*conditions))

        stmt = stmt.offset(skip).limit(limit).order_by(Profile.created_at.desc())
        result = await db.execute(stmt)
        profiles = result.scalars().all()
        
        return profiles
        
    except Exception as e:
        logger.error(f"Error reading profiles: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка чтения профилей: {str(e)}"
        )


async def update_profile(db: AsyncSession, profile_id: int, profile_in: ProfileUpdateSchema) -> ProfileReadSchema:
    """Обновление профиля"""
    try:
        # Получаем профиль с подгрузкой current_location
        stmt = select(Profile).where(Profile.id == profile_id).options(
            selectinload(Profile.current_location).selectinload(Location.region).selectinload(Region.country)
        )
        result = await db.execute(stmt)
        profile = result.scalar_one_or_none()

        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Профиль не найден"
            )
        
        update_data = profile_in.model_dump(exclude_unset=True)
        
        # Проверяем существование локации (если меняется)
        if "current_location_id" in update_data:
            if update_data["current_location_id"] is not None:
                stmt = select(Location).where(Location.id == update_data["current_location_id"])
                result = await db.execute(stmt)
                location = result.scalar_one_or_none()
                if not location:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Локация с ID {update_data['current_location_id']} не найдена"
                    )
        
        if profile_in.university_id:
            stmt = select(Place).where(Place.id == profile_in.university_id)
            result = await db.execute(stmt)
            if not result.scalar_one_or_none():
                raise HTTPException(404, detail=f"Университет с ID {profile_in.university_id} не найден")
        
        # Обновляем поля
        for field, value in update_data.items():
            setattr(profile, field, value)

        await db.commit()
        await db.refresh(profile)
        
        return profile
    
        
    except IntegrityError as e:
        await db.rollback()
        if "UNIQUE constraint failed: profiles.email" in str(e):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Профиль с таким email уже существует"
            )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ошибка целостности данных при обновлении профиля"
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in update_profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка при обновлении профиля: {str(e)}"
        )


async def delete_profile(db: AsyncSession, profile_id: int):
    """Удаление профиля"""
    stmt = select(Profile).where(Profile.id == profile_id)
    result = await db.execute(stmt)
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Профиль не найден"
        )

    await db.delete(profile)
    await db.commit()
    
    return {"ok": True}
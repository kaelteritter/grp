import logging

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import IntegrityError

from app.models.profile import Profile
from app.models.location import Location
from app.models.region import Region
from app.models.country import Country
from app.models.link import Link
from app.models.photo import Photo
from app.models.video import Video
from app.schemas.profile import ProfileCreateSchema, ProfileUpdateSchema

logger = logging.getLogger(__name__)


async def create_profile(db: AsyncSession, profile_in: ProfileCreateSchema):
    """Создание профиля"""
    try:
        # Проверяем существование локации (если указана)
        if profile_in.current_location_id:
            stmt = select(Location).where(Location.id == profile_in.current_location_id)
            result = await db.execute(stmt)
            location = result.scalar_one_or_none()
            if not location:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Локация с ID {profile_in.current_location_id} не найдена"
                )
        
        profile = Profile(**profile_in.model_dump())
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
        
        # Подгружаем связанные данные
        stmt = select(Profile).where(Profile.id == profile.id).options(
            selectinload(Profile.current_location).selectinload(Location.region).selectinload(Region.country),
            selectinload(Profile.links).selectinload(Link.platform),
            selectinload(Profile.photos),
            selectinload(Profile.videos)
        )
        result = await db.execute(stmt)
        profile = result.scalar_one()
        
        return profile
        
    except IntegrityError as e:
        await db.rollback()
        if "UNIQUE constraint failed: profiles.email" in str(e):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
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

async def read_profile(db: AsyncSession, profile_id: int):
    """Получение профиля по ID"""
    stmt = select(Profile).where(Profile.id == profile_id).options(
        selectinload(Profile.current_location).selectinload(Location.region).selectinload(Region.country),
        selectinload(Profile.links).selectinload(Link.platform),
        selectinload(Profile.photos),
        selectinload(Profile.videos)
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def read_profiles(db: AsyncSession, skip: int = 0, limit: int = 100):
    """Получение списка профилей"""
    stmt = select(Profile).options(
        selectinload(Profile.current_location).selectinload(Location.region).selectinload(Region.country),
        selectinload(Profile.links).selectinload(Link.platform),
        selectinload(Profile.photos),
        selectinload(Profile.videos)
    ).offset(skip).limit(limit).order_by(Profile.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()


async def update_profile(db: AsyncSession, profile_id: int, profile_in: ProfileUpdateSchema):
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
        
        # Обновляем поля
        for field, value in update_data.items():
            setattr(profile, field, value)

        await db.commit()
        await db.refresh(profile)
        
        # Подгружаем обновленные связанные данные
        stmt = select(Profile).where(Profile.id == profile_id).options(
            selectinload(Profile.current_location).selectinload(Location.region).selectinload(Region.country),
            selectinload(Profile.links).selectinload(Link.platform),
            selectinload(Profile.photos),
            selectinload(Profile.videos)
        )
        result = await db.execute(stmt)
        profile = result.scalar_one()

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
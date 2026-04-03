from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.profile import Profile
from app.models.location import Location
from app.models.region import Region
from app.models.country import Country
from app.schemas.profile import ProfileCreateSchema, ProfileUpdateSchema


async def create_profile(db: AsyncSession, profile_in: ProfileCreateSchema):
    """
    INSERT профиля в БД
    """
    # Проверяем существование локации, если она указана
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
    
    # Подгружаем все связанные данные в одном запросе
    stmt = select(Profile).where(Profile.id == profile.id).options(
        selectinload(Profile.current_location).options(
            selectinload(Location.region).selectinload(Region.country)
        )
    )
    result = await db.execute(stmt)
    profile = result.scalar_one()
    
    return profile


async def read_profile(db: AsyncSession, profile_id: int):
    """
    SELECT профиля по ID
    """
    stmt = select(Profile).where(Profile.id == profile_id).options(
        selectinload(Profile.current_location).options(
            selectinload(Location.region).selectinload(Region.country)
        )
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def read_profiles(
    db: AsyncSession, 
    skip: int = 0, 
    limit: int = 100
):
    """
    SELECT всех профилей с пагинацией
    """
    stmt = select(Profile).options(
        selectinload(Profile.current_location).options(
            selectinload(Location.region).selectinload(Region.country)
        )
    ).offset(skip).limit(limit).order_by(Profile.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()


async def update_profile(
    db: AsyncSession, 
    profile_id: int, 
    profile_in: ProfileUpdateSchema
):
    """
    UPDATE профиля по ID
    """
    # Проверяем существование профиля
    stmt = select(Profile).where(Profile.id == profile_id)
    result = await db.execute(stmt)
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Профиль не найден"
        )
    
    # Проверяем существование локации, если она указана в обновлении
    update_data = profile_in.model_dump(exclude_unset=True)
    
    if "current_location_id" in update_data and update_data["current_location_id"] is not None:
        stmt = select(Location).where(Location.id == update_data["current_location_id"])
        result = await db.execute(stmt)
        location = result.scalar_one_or_none()
        
        if not location:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Локация с ID {update_data['current_location_id']} не найдена"
            )

    for field, value in update_data.items():
        setattr(profile, field, value)

    await db.commit()
    
    # Подгружаем все связанные данные
    stmt = select(Profile).where(Profile.id == profile_id).options(
        selectinload(Profile.current_location).options(
            selectinload(Location.region).selectinload(Region.country)
        )
    )
    result = await db.execute(stmt)
    profile = result.scalar_one()

    return profile


async def delete_profile(db: AsyncSession, profile_id: int):
    """
    DELETE профиля по ID
    """
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
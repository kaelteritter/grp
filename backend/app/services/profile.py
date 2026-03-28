# backend/app/services/profile.py

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.profile import Profile
from app.schemas.profile import ProfileCreateSchema, ProfileUpdateSchema


async def create_profile(db: AsyncSession, profile_in: ProfileCreateSchema):
    """
    INSERT профиля в БД
    """
    profile = Profile(**profile_in.model_dump())
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile


async def read_profile(db: AsyncSession, profile_id: int):
    """
    SELECT профиля по ID
    """
    stmt = select(Profile).where(Profile.id == profile_id)
    result = await db.execute(stmt)
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(status_code=404, detail="Профиль не найден")

    return profile


async def read_profiles(db: AsyncSession):
    """
    SELECT всех профилей
    """
    stmt = select(Profile)
    result = await db.execute(stmt)
    return result.scalars().all()


async def update_profile(db: AsyncSession, profile_id: int, profile_in: ProfileUpdateSchema):
    """
    UPDATE профиля по ID
    """
    stmt = select(Profile).where(Profile.id == profile_id)
    result = await db.execute(stmt)
    profile = result.scalar_one_or_none()

    # 2. Обрабатываем, если не найдено
    if not profile:
        raise HTTPException(status_code=404, detail="Профиль не найден")

    # 3. Обновление
    update_data = profile_in.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(profile, field, value)

    # 4. Сохранение
    await db.commit()
    await db.refresh(profile)

    return profile


async def delete_profile(db: AsyncSession, profile_id: int):
    """
    DELETE профиля по ID
    """
    stmt = select(Profile).where(Profile.id == profile_id)
    result = await db.execute(stmt)
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(status_code=404, detail="Профиль не найден")

    await db.delete(profile)
    await db.commit()

    return {"ok": True}

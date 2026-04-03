# backend/app/services/platform.py

from asyncio.log import logger

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status

from app.models.platform import Platform
from backend.app.schemas.platform import PlatformUpdateSchema, PlatformCreateSchema


async def read_platforms(db: AsyncSession):
    stmt = select(Platform)
    result = await db.execute(stmt)
    return result.scalars().all()


async def create_platform(db: AsyncSession, platform_in: PlatformCreateSchema):
    try:
        platform = Platform(**platform_in.model_dump())
        db.add(platform)
        await db.commit()
        await db.refresh(platform)
        return platform
    except IntegrityError as e:
        await db.rollback()
        logger.error(f"Ошибка при создании платформы: {e}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Платформа с base_url '{platform_in.base_url}' уже существует"
        )


async def read_platform(db: AsyncSession, platform_id: int):
    stmt = select(Platform).where(Platform.id == platform_id)
    result = await db.execute(stmt)
    platform = result.scalar_one_or_none()
    if not platform:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Платформа не найдена"
        )
    return platform


async def update_platform(db: AsyncSession, platform_id: int, platform_in: PlatformUpdateSchema):
    try:
        platform = await read_platform(db, platform_id)
        if not platform:
            return None
        
        update_data = platform_in.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(platform, field, value)
        await db.commit()
        await db.refresh(platform)
        return platform
    except IntegrityError as e:
        await db.rollback()
        logger.error(f"Ошибка при обновлении платформы: {e}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Платформа с base_url '{platform_in.base_url}' уже существует"
        )


async def delete_platform(db: AsyncSession, platform_id: int):
    platform = await read_platform(db, platform_id)
    if not platform:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Платформа не найдена"
        )
    await db.delete(platform)
    await db.commit()
    return {"ok": True}
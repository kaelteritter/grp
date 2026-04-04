import logging
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.season import Season
from app.schemas.season import SeasonCreateSchema, SeasonUpdateSchema

logger = logging.getLogger(__name__)


async def create_season(db: AsyncSession, season_in: SeasonCreateSchema):
    """Создание времени года"""
    try:
        season = Season(**season_in.model_dump())
        db.add(season)
        await db.commit()
        await db.refresh(season)
        return season
    except IntegrityError as e:
        await db.rollback()
        if "UNIQUE constraint failed" in str(e):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Время года '{season_in.name}' уже существует"
            )
        logger.error(f"IntegrityError in create_season: {e}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ошибка целостности данных при создании времени года"
        )
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in create_season: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка при создании времени года: {str(e)}"
        )


async def read_season(db: AsyncSession, season_id: int):
    """Получение времени года по ID"""
    stmt = select(Season).where(Season.id == season_id)
    result = await db.execute(stmt)
    season = result.scalar_one_or_none()
    
    if not season:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Время года не найдено"
        )
    return season


async def read_seasons(db: AsyncSession, skip: int = 0, limit: int = 100):
    """Получение списка времен года"""
    stmt = select(Season).order_by(Season.name).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()


async def update_season(db: AsyncSession, season_id: int, season_in: SeasonUpdateSchema):
    """Обновление времени года"""
    try:
        season = await read_season(db, season_id)
        
        update_data = season_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(season, field, value)
        
        await db.commit()
        await db.refresh(season)
        return season
    except IntegrityError as e:
        await db.rollback()
        if "UNIQUE constraint failed" in str(e):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Время года с таким названием уже существует"
            )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ошибка целостности данных при обновлении времени года"
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in update_season: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка при обновлении времени года: {str(e)}"
        )


async def delete_season(db: AsyncSession, season_id: int):
    """Удаление времени года"""
    season = await read_season(db, season_id)
    await db.delete(season)
    await db.commit()
    return {"ok": True}
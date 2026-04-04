import logging
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.daytime import DayTime
from app.schemas.daytime import DayTimeCreateSchema, DayTimeUpdateSchema

logger = logging.getLogger(__name__)


async def create_daytime(db: AsyncSession, daytime_in: DayTimeCreateSchema):
    """Создание времени суток"""
    try:
        daytime = DayTime(**daytime_in.model_dump())
        db.add(daytime)
        await db.commit()
        await db.refresh(daytime)
        return daytime
    except IntegrityError as e:
        await db.rollback()
        if "UNIQUE constraint failed" in str(e):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Время суток '{daytime_in.name}' уже существует"
            )
        logger.error(f"IntegrityError in create_daytime: {e}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ошибка целостности данных при создании времени суток"
        )
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in create_daytime: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка при создании времени суток: {str(e)}"
        )


async def read_daytime(db: AsyncSession, daytime_id: int):
    """Получение времени суток по ID"""
    stmt = select(DayTime).where(DayTime.id == daytime_id)
    result = await db.execute(stmt)
    daytime = result.scalar_one_or_none()
    
    if not daytime:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Время суток не найдено"
        )
    return daytime


async def read_daytimes(db: AsyncSession, skip: int = 0, limit: int = 100):
    """Получение списка времен суток"""
    stmt = select(DayTime).order_by(DayTime.name).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()


async def update_daytime(db: AsyncSession, daytime_id: int, daytime_in: DayTimeUpdateSchema):
    """Обновление времени суток"""
    try:
        daytime = await read_daytime(db, daytime_id)
        
        update_data = daytime_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(daytime, field, value)
        
        await db.commit()
        await db.refresh(daytime)
        return daytime
    except IntegrityError as e:
        await db.rollback()
        if "UNIQUE constraint failed" in str(e):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Время суток с таким названием уже существует"
            )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ошибка целостности данных при обновлении времени суток"
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in update_daytime: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка при обновлении времени суток: {str(e)}"
        )


async def delete_daytime(db: AsyncSession, daytime_id: int):
    """Удаление времени суток"""
    daytime = await read_daytime(db, daytime_id)
    await db.delete(daytime)
    await db.commit()
    return {"ok": True}
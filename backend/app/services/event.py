import logging
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.event import Event
from app.schemas.event import EventCreateSchema, EventUpdateSchema

logger = logging.getLogger(__name__)


async def create_event(db: AsyncSession, event_in: EventCreateSchema):
    """Создание события"""
    try:
        event = Event(**event_in.model_dump())
        db.add(event)
        await db.commit()
        await db.refresh(event)
        return event
    except IntegrityError as e:
        await db.rollback()
        if "UNIQUE constraint failed" in str(e):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Событие '{event_in.name}' уже существует"
            )
        logger.error(f"IntegrityError in create_event: {e}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ошибка целостности данных при создании события"
        )
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in create_event: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка при создании события: {str(e)}"
        )


async def read_event(db: AsyncSession, event_id: int):
    """Получение события по ID"""
    stmt = select(Event).where(Event.id == event_id)
    result = await db.execute(stmt)
    event = result.scalar_one_or_none()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Событие не найдено"
        )
    return event


async def read_events(db: AsyncSession, skip: int = 0, limit: int = 100):
    """Получение списка событий"""
    stmt = select(Event).order_by(Event.name).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()


async def update_event(db: AsyncSession, event_id: int, event_in: EventUpdateSchema):
    """Обновление события"""
    try:
        event = await read_event(db, event_id)
        
        update_data = event_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(event, field, value)
        
        await db.commit()
        await db.refresh(event)
        return event
    except IntegrityError as e:
        await db.rollback()
        if "UNIQUE constraint failed" in str(e):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Событие с таким названием уже существует"
            )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ошибка целостности данных при обновлении события"
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in update_event: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка при обновлении события: {str(e)}"
        )


async def delete_event(db: AsyncSession, event_id: int):
    """Удаление события"""
    event = await read_event(db, event_id)
    await db.delete(event)
    await db.commit()
    return {"ok": True}
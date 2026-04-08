import logging
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.photo_tag import PhotoTag
from app.models.photo import Photo
from app.models.profile import Profile
from app.schemas.photo_tag import PhotoTagCreateSchema, PhotoTagUpdateSchema

logger = logging.getLogger(__name__)


async def create_photo_tag(db: AsyncSession, tag_in: PhotoTagCreateSchema):
    """Создание отметки на фото"""
    try:
        # Проверяем существование фото
        stmt = select(Photo).where(Photo.id == tag_in.photo_id)
        result = await db.execute(stmt)
        photo = result.scalar_one_or_none()
        
        if not photo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Фото с ID {tag_in.photo_id} не найдено"
            )
        
        # Проверяем существование профиля
        stmt = select(Profile).where(Profile.id == tag_in.profile_id)
        result = await db.execute(stmt)
        profile = result.scalar_one_or_none()
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Профиль с ID {tag_in.profile_id} не найден"
            )
        
        # Проверяем, не существует ли уже отметка
        stmt = select(PhotoTag).where(
            and_(
                PhotoTag.photo_id == tag_in.photo_id,
                PhotoTag.profile_id == tag_in.profile_id
            )
        )
        result = await db.execute(stmt)
        existing = result.scalar_one_or_none()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Отметка для этого профиля на данном фото уже существует"
            )
        
        tag = PhotoTag(**tag_in.model_dump())
        db.add(tag)
        await db.commit()
        await db.refresh(tag)
        
        # Подгружаем связанные данные
        stmt = select(PhotoTag).where(PhotoTag.id == tag.id).options(
            selectinload(PhotoTag.photo),
            selectinload(PhotoTag.profile)
        )
        result = await db.execute(stmt)
        tag = result.scalar_one()
        
        return tag
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in create_photo_tag: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка при создании отметки: {str(e)}"
        )


async def read_photo_tag(db: AsyncSession, tag_id: int):
    """Получение отметки по ID"""
    stmt = select(PhotoTag).where(PhotoTag.id == tag_id).options(
        selectinload(PhotoTag.photo),
        selectinload(PhotoTag.profile)
    )
    result = await db.execute(stmt)
    tag = result.scalar_one_or_none()

    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Отметка не найдена"
        )
    
    return tag


async def read_photo_tags(
    db: AsyncSession,
    photo_id: Optional[int] = None,
    profile_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100
):
    """Получение списка отметок с фильтрацией"""
    stmt = select(PhotoTag).options(
        selectinload(PhotoTag.photo),
        selectinload(PhotoTag.profile)
    )
    
    if photo_id:
        stmt = stmt.where(PhotoTag.photo_id == photo_id)
    if profile_id:
        stmt = stmt.where(PhotoTag.profile_id == profile_id)
    
    stmt = stmt.order_by(PhotoTag.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(stmt)
    tags = result.scalars().all()

    for tag in tags:
        tag.photo_url = tag.photo.url if tag.photo else None

    return tags


async def update_photo_tag(
    db: AsyncSession,
    tag_id: int,
    tag_in: PhotoTagUpdateSchema
):
    """Обновление отметки"""
    try:
        tag = await read_photo_tag(db, tag_id)
        
        update_data = tag_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(tag, field, value)
        
        await db.commit()
        await db.refresh(tag)
        
        return tag
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in update_photo_tag: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка при обновлении отметки: {str(e)}"
        )


async def delete_photo_tag(db: AsyncSession, tag_id: int):
    """Удаление отметки"""
    tag = await read_photo_tag(db, tag_id)
    
    await db.delete(tag)
    await db.commit()
    
    return {"ok": True}
import logging
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.storage import storage
from app.models.video import Video
from app.models.profile import Profile
from app.schemas.video import VideoCreateSchema, VideoUpdateSchema

logger = logging.getLogger(__name__)


async def create_video(db: AsyncSession, video_in: VideoCreateSchema):
    """Создание видео"""
    try:
        # Проверяем существование профиля
        stmt = select(Profile).where(Profile.id == video_in.profile_id)
        result = await db.execute(stmt)
        profile = result.scalar_one_or_none()
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Профиль с ID {video_in.profile_id} не найден"
            )
        
        # Если это обложка, снимаем флаг is_cover с других видео профиля
        if video_in.is_cover:
            stmt = select(Video).where(Video.profile_id == video_in.profile_id)
            result = await db.execute(stmt)
            existing_videos = result.scalars().all()
            for video in existing_videos:
                video.is_cover = False
            await db.flush()
        
        video = Video(**video_in.model_dump())
        db.add(video)
        await db.commit()
        await db.refresh(video)
        
        # Подгружаем связанные данные
        stmt = select(Video).where(Video.id == video.id).options(selectinload(Video.profile))
        result = await db.execute(stmt)
        video = result.scalar_one()
        
        return video
        
    except IntegrityError as e:
        await db.rollback()
        logger.error(f"IntegrityError in create_video: {e}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ошибка целостности данных при создании видео"
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in create_video: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка при создании видео: {str(e)}"
        )


async def read_video(db: AsyncSession, video_id: int):
    """Получение видео по ID"""
    stmt = select(Video).where(Video.id == video_id).options(selectinload(Video.profile))
    result = await db.execute(stmt)
    video = result.scalar_one_or_none()

    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Видео не найдено"
        )
    
    return video


async def read_videos(
    db: AsyncSession,
    profile_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100
):
    """Получение списка видео с фильтрацией по профилю"""
    stmt = select(Video).options(selectinload(Video.profile))
    
    if profile_id:
        stmt = stmt.where(Video.profile_id == profile_id)
    
    stmt = stmt.order_by(Video.sort_order, Video.created_at).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()


async def update_video(
    db: AsyncSession,
    video_id: int,
    video_in: VideoUpdateSchema
):
    """Обновление видео"""
    try:
        video = await read_video(db, video_id)
        
        update_data = video_in.model_dump(exclude_unset=True)
        
        # Если устанавливаем обложку, снимаем флаг с других видео профиля
        if update_data.get("is_cover"):
            stmt = select(Video).where(
                Video.profile_id == video.profile_id,
                Video.id != video_id
            )
            result = await db.execute(stmt)
            existing_videos = result.scalars().all()
            for existing_video in existing_videos:
                existing_video.is_cover = False
            await db.flush()
        
        for field, value in update_data.items():
            setattr(video, field, value)
        
        await db.commit()
        await db.refresh(video)
        
        # Подгружаем связанные данные
        stmt = select(Video).where(Video.id == video_id).options(selectinload(Video.profile))
        result = await db.execute(stmt)
        video = result.scalar_one()
        
        return video
        
    except IntegrityError as e:
        await db.rollback()
        logger.error(f"IntegrityError in update_video: {e}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ошибка целостности данных при обновлении видео"
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in update_video: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка при обновлении видео: {str(e)}"
        )


async def delete_video(db: AsyncSession, video_id: int):
    """Удаление видео"""
    video = await read_video(db, video_id)
    
    await db.delete(video)
    await db.commit()
    
    return {"ok": True}


async def set_cover(db: AsyncSession, profile_id: int, video_id: int):
    """Установить видео как обложку профиля"""
    # Проверяем существование профиля
    stmt = select(Profile).where(Profile.id == profile_id)
    result = await db.execute(stmt)
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Профиль с ID {profile_id} не найден"
        )
    
    # Проверяем существование видео
    stmt = select(Video).where(Video.id == video_id, Video.profile_id == profile_id)
    result = await db.execute(stmt)
    video = result.scalar_one_or_none()
    
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Видео с ID {video_id} не найдено у профиля {profile_id}"
        )
    
    # Снимаем флаг is_cover со всех видео профиля
    stmt = select(Video).where(Video.profile_id == profile_id)
    result = await db.execute(stmt)
    all_videos = result.scalars().all()
    for v in all_videos:
        v.is_cover = False
    
    # Устанавливаем новую обложку
    video.is_cover = True
    
    await db.commit()
    await db.refresh(video)
    
    return video


async def create_videos(db, files, profile_id):
    uploaded_videos = []
    
    # Проверяем существование профиля
    stmt = select(Profile).where(Profile.id == profile_id)
    result = await db.execute(stmt)
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Профиль с ID {profile_id} не найден"
        )
    
    for index, file in enumerate(files):
        # Читаем содержимое файла
        content = await file.read()
        
        # Сохраняем в хранилище
        file_url = storage.save_video(profile_id, content, file.filename)
        
        # Создаем запись в БД
        video_in = VideoCreateSchema(
            url=file_url,
            profile_id=profile_id,
            title=file.filename,
            duration=0,
            thumbnail_url=None,
            sort_order=index,
        )
        
        video = await create_video(db, video_in)
        uploaded_videos.append(video)
    
    return uploaded_videos
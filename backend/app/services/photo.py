from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.models.photo import Photo
from app.models.profile import Profile
from app.schemas.photo import PhotoCreateSchema, PhotoUpdateSchema


async def create_photo(db: AsyncSession, photo_in: PhotoCreateSchema):
    """Создание фотографии"""
    try:
        # Проверяем существование профиля
        stmt = select(Profile).where(Profile.id == photo_in.profile_id)
        result = await db.execute(stmt)
        profile = result.scalar_one_or_none()
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Профиль с ID {photo_in.profile_id} не найден"
            )
        
        # Если это аватар, снимаем флаг is_avatar с других фото профиля
        if photo_in.is_avatar:
            stmt = select(Photo).where(Photo.profile_id == photo_in.profile_id)
            result = await db.execute(stmt)
            existing_photos = result.scalars().all()
            for photo in existing_photos:
                photo.is_avatar = False
            await db.flush()
        
        photo = Photo(**photo_in.model_dump())
        db.add(photo)
        await db.commit()
        await db.refresh(photo)
        
        # Подгружаем связанные данные
        stmt = select(Photo).where(Photo.id == photo.id).options(selectinload(Photo.profile))
        result = await db.execute(stmt)
        photo = result.scalar_one()
        
        return photo
        
    except ValueError as e:
        # Обрабатываем ошибки валидации из модели SQLAlchemy
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(e)
        )
    except IntegrityError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ошибка целостности данных при создании фотографии"
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка при создании фотографии: {str(e)}"
        )


async def update_photo(db: AsyncSession, photo_id: int, photo_in: PhotoUpdateSchema):
    """Обновление фотографии"""
    try:
        photo = await read_photo(db, photo_id)
        
        update_data = photo_in.model_dump(exclude_unset=True)
        
        # Если устанавливаем аватар, снимаем флаг с других фото профиля
        if update_data.get("is_avatar"):
            stmt = select(Photo).where(
                Photo.profile_id == photo.profile_id,
                Photo.id != photo_id
            )
            result = await db.execute(stmt)
            existing_photos = result.scalars().all()
            for existing_photo in existing_photos:
                existing_photo.is_avatar = False
            await db.flush()
        
        for field, value in update_data.items():
            setattr(photo, field, value)
        
        await db.commit()
        await db.refresh(photo)
        
        # Подгружаем связанные данные
        stmt = select(Photo).where(Photo.id == photo_id).options(selectinload(Photo.profile))
        result = await db.execute(stmt)
        photo = result.scalar_one()
        
        return photo
        
    except ValueError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except IntegrityError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ошибка целостности данных при обновлении фотографии"
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка при обновлении фотографии: {str(e)}"
        )



async def read_photos(db: AsyncSession, profile_id: Optional[int] = None, skip: int = 0, limit: int = 100):
    """Получение списка фотографий с фильтрацией по профилю"""
    stmt = select(Photo).options(selectinload(Photo.profile))
    
    if profile_id:
        stmt = stmt.where(Photo.profile_id == profile_id)
    
    stmt = stmt.order_by(Photo.sort_order, Photo.created_at).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()


async def read_photo(db: AsyncSession, photo_id: int):
    """Получение фотографии по ID"""
    stmt = select(Photo).where(Photo.id == photo_id).options(selectinload(Photo.profile))
    result = await db.execute(stmt)
    photo = result.scalar_one_or_none()
    
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Фотография не найдена"
        )
    
    return photo


async def delete_photo(db: AsyncSession, photo_id: int):
    """Удаление фотографии"""
    photo = await read_photo(db, photo_id)
    
    await db.delete(photo)
    await db.commit()
    
    return {"ok": True}


async def set_avatar(db: AsyncSession, profile_id: int, photo_id: int):
    """Установить фото как аватар профиля"""
    # Проверяем существование профиля
    stmt = select(Profile).where(Profile.id == profile_id)
    result = await db.execute(stmt)
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Профиль с ID {profile_id} не найден"
        )
    
    # Проверяем существование фото
    stmt = select(Photo).where(Photo.id == photo_id, Photo.profile_id == profile_id)
    result = await db.execute(stmt)
    photo = result.scalar_one_or_none()
    
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Фото с ID {photo_id} не найдено у профиля {profile_id}"
        )
    
    # Снимаем флаг is_avatar со всех фото профиля
    stmt = select(Photo).where(Photo.profile_id == profile_id)
    result = await db.execute(stmt)
    all_photos = result.scalars().all()
    for p in all_photos:
        p.is_avatar = False
    
    # Устанавливаем новый аватар
    photo.is_avatar = True
    
    await db.commit()
    await db.refresh(photo)
    
    return photo


async def reorder_photos(db: AsyncSession, profile_id: int, photo_ids: List[int]):
    """
    Обновить порядок фотографий
    """
    for index, photo_id in enumerate(photo_ids):
        stmt = select(Photo).where(Photo.id == photo_id, Photo.profile_id == profile_id)
        result = await db.execute(stmt)
        photo = result.scalar_one_or_none()
        if photo:
            photo.sort_order = index
    await db.commit()
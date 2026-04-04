import logging
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.cloth import Cloth
from app.models.photo import Photo
from app.schemas.cloth import ClothCreateSchema, ClothUpdateSchema

logger = logging.getLogger(__name__)


async def read_cloth(db: AsyncSession, cloth_id: int):
    """Получение элемента одежды по ID"""
    stmt = select(Cloth).where(Cloth.id == cloth_id).options(
        selectinload(Cloth.photos)
    )
    result = await db.execute(stmt)
    cloth = result.scalar_one_or_none()

    if not cloth:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Элемент одежды не найден"
        )
    
    # Подсчитываем количество фото
    cloth.photo_count = len(cloth.photos)
    
    return cloth


async def read_clothes(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    color: Optional[str] = None,
    material: Optional[str] = None
):
    """Получение списка одежды с фильтрацией"""
    stmt = select(Cloth).options(selectinload(Cloth.photos))
    
    if search:
        stmt = stmt.where(Cloth.name.ilike(f"%{search}%"))
    if color:
        stmt = stmt.where(Cloth.color.ilike(f"%{color}%"))
    if material:
        stmt = stmt.where(Cloth.material.ilike(f"%{material}%"))
    
    stmt = stmt.order_by(Cloth.name).offset(skip).limit(limit)
    result = await db.execute(stmt)
    clothes = result.scalars().all()
    
    # Добавляем количество фото для каждого элемента
    for cloth in clothes:
        cloth.photo_count = len(cloth.photos)
    
    return clothes

async def create_cloth(db: AsyncSession, cloth_in: ClothCreateSchema):
    """Создание одежды"""
    try:
        # Создаем объект одежды
        cloth = Cloth(
            name=cloth_in.name,
            color=cloth_in.color,
            material=cloth_in.material,
            cover_url=cloth_in.cover_url
        )
        
        db.add(cloth)
        await db.commit()
        await db.refresh(cloth)
        
        # Добавляем связи с фото (если указаны)
        if cloth_in.photo_ids:
            stmt = select(Photo).where(Photo.id.in_(cloth_in.photo_ids))
            result = await db.execute(stmt)
            photos = result.scalars().all()
            
            if len(photos) != len(cloth_in.photo_ids):
                found_ids = [p.id for p in photos]
                missing_ids = set(cloth_in.photo_ids) - set(found_ids)
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Фото с ID {list(missing_ids)} не найдены"
                )
            
            cloth.photos = photos
            await db.commit()
            await db.refresh(cloth)
        
        # Подсчитываем количество фото
        cloth.photo_count = len(cloth.photos)
        
        return cloth
        
    except IntegrityError as e:
        await db.rollback()
        logger.error(f"IntegrityError in create_cloth: {e}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ошибка целостности данных при создании элемента одежды"
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in create_cloth: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка при создании элемента одежды: {str(e)}"
        )


async def update_cloth(
    db: AsyncSession,
    cloth_id: int,
    cloth_in: ClothUpdateSchema
):
    """Обновление элемента одежды"""
    try:
        cloth = await read_cloth(db, cloth_id)
        
        update_data = cloth_in.model_dump(exclude_unset=True)
        
        # Обновляем основные поля
        if "name" in update_data and update_data["name"] is not None:
            cloth.name = update_data["name"]
        if "color" in update_data and update_data["color"] is not None:
            cloth.color = update_data["color"]
        if "material" in update_data and update_data["material"] is not None:
            cloth.material = update_data["material"]
        if "cover_url" in update_data:
            cloth.cover_url = update_data["cover_url"]
        
        await db.commit()
        await db.refresh(cloth)
        
        # Обновляем связи с фото (если указаны)
        if "photo_ids" in update_data:
            if update_data["photo_ids"] is None or len(update_data["photo_ids"]) == 0:
                cloth.photos = []
            else:
                stmt = select(Photo).where(Photo.id.in_(update_data["photo_ids"]))
                result = await db.execute(stmt)
                photos = result.scalars().all()
                
                if len(photos) != len(update_data["photo_ids"]):
                    found_ids = [p.id for p in photos]
                    missing_ids = set(update_data["photo_ids"]) - set(found_ids)
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Фото с ID {list(missing_ids)} не найдены"
                    )
                cloth.photos = photos
        
        await db.commit()
        await db.refresh(cloth)
        
        # Подсчитываем количество фото
        cloth.photo_count = len(cloth.photos)
        
        return cloth
        
    except IntegrityError as e:
        await db.rollback()
        logger.error(f"IntegrityError in update_cloth: {e}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ошибка целостности данных при обновлении элемента одежды"
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in update_cloth: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка при обновлении элемента одежды: {str(e)}"
        )

async def delete_cloth(db: AsyncSession, cloth_id: int):
    """Удаление элемента одежды"""
    cloth = await read_cloth(db, cloth_id)
    
    await db.delete(cloth)
    await db.commit()
    
    return {"ok": True}


async def add_photo_to_cloth(
    db: AsyncSession,
    cloth_id: int,
    photo_id: int
):
    """Добавление фото к элементу одежды"""
    try:
        cloth = await read_cloth(db, cloth_id)
        photo = await db.get(Photo, photo_id)
        
        if not photo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Фото с ID {photo_id} не найдено"
            )
        
        if photo not in cloth.photos:
            cloth.photos.append(photo)
            await db.commit()
        
        return {"ok": True, "message": "Фото добавлено к элементу одежды"}
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in add_photo_to_cloth: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка при добавлении фото: {str(e)}"
        )


async def remove_photo_from_cloth(
    db: AsyncSession,
    cloth_id: int,
    photo_id: int
):
    """Удаление фото из элемента одежды"""
    try:
        cloth = await read_cloth(db, cloth_id)
        photo = await db.get(Photo, photo_id)
        
        if not photo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Фото с ID {photo_id} не найдено"
            )
        
        if photo in cloth.photos:
            cloth.photos.remove(photo)
            await db.commit()
        
        return {"ok": True, "message": "Фото удалено из элемента одежды"}
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in remove_photo_from_cloth: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка при удалении фото: {str(e)}"
        )
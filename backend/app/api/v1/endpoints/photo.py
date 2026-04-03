from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional

from app.core.database import SessionDep
from app.schemas.photo import PhotoCreateSchema, PhotoReadSchema, PhotoUpdateSchema
from app import services


router = APIRouter(prefix="/photos", tags=["photos"])


def enrich_photo(photo):
    """Преобразует модель Photo в Pydantic схему"""
    return PhotoReadSchema.model_validate(photo, from_attributes=True)


@router.post("/", response_model=PhotoReadSchema, status_code=status.HTTP_201_CREATED)
async def create_photo(
    db: SessionDep,
    photo_in: PhotoCreateSchema
):
    """
    Создать новую фотографию
    """
    photo = await services.create_photo(db, photo_in)
    return enrich_photo(photo)


@router.get("/", response_model=List[PhotoReadSchema])
async def read_photos(
    db: SessionDep,
    profile_id: Optional[int] = Query(None, description="Фильтр по ID профиля"),
    skip: int = Query(0, ge=0, description="Пропустить записей"),
    limit: int = Query(100, ge=1, le=1000, description="Лимит записей")
):
    """
    Получить список фотографий с фильтрацией по профилю
    """
    photos = await services.read_photos(db, profile_id=profile_id, skip=skip, limit=limit)
    return [enrich_photo(photo) for photo in photos]


@router.get("/{photo_id}", response_model=PhotoReadSchema)
async def read_photo(
    db: SessionDep,
    photo_id: int
):
    """
    Получить фотографию по ID
    """
    photo = await services.read_photo(db, photo_id)
    return enrich_photo(photo)


@router.patch("/{photo_id}", response_model=PhotoReadSchema)
async def update_photo(
    db: SessionDep,
    photo_id: int,
    photo_in: PhotoUpdateSchema
):
    """
    Обновить фотографию
    """
    photo = await services.update_photo(db, photo_id, photo_in)
    return enrich_photo(photo)


@router.delete("/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_photo(
    db: SessionDep,
    photo_id: int
):
    """
    Удалить фотографию
    """
    await services.delete_photo(db, photo_id)
    return None


@router.patch("/profile/{profile_id}/avatar/{photo_id}", response_model=PhotoReadSchema)
async def set_profile_avatar(
    db: SessionDep,
    profile_id: int,
    photo_id: int
):
    """
    Установить фотографию как аватар профиля
    """
    photo = await services.set_avatar(db, profile_id, photo_id)
    return enrich_photo(photo)
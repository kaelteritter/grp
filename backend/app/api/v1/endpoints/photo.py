import os
from pathlib import Path
import uuid

from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile, status
from typing import List, Optional

from app.core.database import SessionDep
from app.schemas.photo import PhotoCreateSchema, PhotoReadSchema, PhotoUpdateSchema
from app import services


router = APIRouter(prefix="/photos", tags=["photos"])



@router.post("/", response_model=PhotoReadSchema, status_code=status.HTTP_201_CREATED)
async def create_photo(
    db: SessionDep,
    photo_in: PhotoCreateSchema
):
    """
    Создать новую фотографию
    """
    return await services.create_photo(db, photo_in)



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
    return await services.read_photos(db, profile_id=profile_id, skip=skip, limit=limit)


@router.get("/{photo_id}", response_model=PhotoReadSchema)
async def read_photo(
    db: SessionDep,
    photo_id: int
):
    """
    Получить фотографию по ID
    """
    return await services.read_photo(db, photo_id)


@router.patch("/{photo_id}", response_model=PhotoReadSchema)
async def update_photo(
    db: SessionDep,
    photo_id: int,
    photo_in: PhotoUpdateSchema
):
    """
    Обновить фотографию
    """
    return await services.update_photo(db, photo_id, photo_in)


@router.delete("/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_photo(
    db: SessionDep,
    photo_id: int
):
    """
    Удалить фотографию из хранилища и БД
    """
    # Удаляем запись из БД
    await services.delete_photo(db, photo_id)
    return None


@router.delete("/profile/{profile_id}/all", status_code=status.HTTP_204_NO_CONTENT)
async def delete_photos(
    db: SessionDep,
    profile_id: int
):
    """
    Удалить все фотографии профиля
    """
    return services.delete_photos(db, profile_id)


@router.patch("/profile/{profile_id}/avatar/{photo_id}", response_model=PhotoReadSchema)
async def set_profile_avatar(
    db: SessionDep,
    profile_id: int,
    photo_id: int
):
    """
    Установить фотографию как аватар профиля
    """
    return await services.set_avatar(db, profile_id, photo_id)



@router.post("/multiple/", response_model=List[PhotoReadSchema], status_code=status.HTTP_201_CREATED)
async def upload_multiple_photos(
    db: SessionDep,
    files: List[UploadFile] = File(...),
    profile_id: int = Form(...)
):
    """
    Загрузить несколько фотографий в S3-подобное хранилище
    """
    return await services.create_photos(db, files, profile_id)
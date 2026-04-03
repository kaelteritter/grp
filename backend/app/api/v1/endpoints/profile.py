# backend/app/api/v1/endpoints/profiles.py

from fastapi import APIRouter, status
from typing import List

from app.core.database import SessionDep
from app.schemas.profile import ProfileReadSchema, ProfileCreateSchema, ProfileUpdateSchema
from app import services


router = APIRouter(
    prefix="/profiles",
    tags=["profiles"]
)


@router.get("/", response_model=List[ProfileReadSchema])
async def read_profiles(
    db: SessionDep,
):
    """
    Получить список всех профилей с пагинацией
    """
    profiles = await services.read_profiles(db)
    return profiles


@router.post("/", response_model=ProfileReadSchema, status_code=status.HTTP_201_CREATED)
async def create_profile(
    db: SessionDep,
    profile_in: ProfileCreateSchema
):
    """
    Создать новый профиль
    """
    profile = await services.create_profile(db, profile_in)
    return profile


@router.get("/{profile_id}", response_model=ProfileReadSchema)
async def read_profile(
    db: SessionDep,
    profile_id: int
):
    """
    Получить профиль по ID
    """
    profile = await services.read_profile(db, profile_id)
    return profile


@router.patch("/{profile_id}", response_model=ProfileReadSchema)
async def update_profile(
    db: SessionDep,
    profile_id: int,
    profile_in: ProfileUpdateSchema
):
    """
    Обновить профиль
    """
    profile = await services.update_profile(db, profile_id, profile_in)
    return profile


@router.delete("/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_profile(
    db: SessionDep,
    profile_id: int
):
    """
    Удалить профиль
    """
    await services.delete_profile(db, profile_id)
    return {
        "id": profile_id,
        "status": "deleted",
    }
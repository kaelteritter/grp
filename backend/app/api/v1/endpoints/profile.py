from fastapi import APIRouter, HTTPException, status
from typing import List

from app.core.database import SessionDep
from app.schemas.profile import ProfileReadSchema, ProfileCreateSchema, ProfileUpdateSchema
from app import services


router = APIRouter(
    prefix="/profiles",
    tags=["profiles"]
)


def enrich_profile_with_location(profile):
    """Добавляет данные о локации, регионе и стране в ответ"""
    return ProfileReadSchema.model_validate(profile, from_attributes=True)



@router.get("/", response_model=List[ProfileReadSchema])
async def read_profiles(
    db: SessionDep,
    skip: int = 0,
    limit: int = 100
):
    """
    Получить список всех профилей с пагинацией
    """
    profiles = await services.read_profiles(db, skip=skip, limit=limit)
    return [enrich_profile_with_location(profile) for profile in profiles]


@router.post("/", response_model=ProfileReadSchema, status_code=status.HTTP_201_CREATED)
async def create_profile(
    db: SessionDep,
    profile_in: ProfileCreateSchema
):
    """
    Создать новый профиль
    """
    profile = await services.create_profile(db, profile_in)
    return enrich_profile_with_location(profile)


@router.get("/{profile_id}", response_model=ProfileReadSchema)
async def read_profile(
    db: SessionDep,
    profile_id: int
):
    """
    Получить профиль по ID
    """
    profile = await services.read_profile(db, profile_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Профиль не найден"
        )
    return enrich_profile_with_location(profile)


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
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Профиль не найден"
        )
    return enrich_profile_with_location(profile)


@router.delete("/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_profile(
    db: SessionDep,
    profile_id: int
):
    """
    Удалить профиль
    """
    result = await services.delete_profile(db, profile_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Профиль не найден"
        )
    return None
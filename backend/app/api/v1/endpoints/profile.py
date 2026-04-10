# backend/app/api/v1/endpoints/profile.py

from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional

from app.core.database import SessionDep
from app.schemas.profile import ProfileReadSchema, ProfileCreateSchema, ProfileUpdateSchema
from app import services


router = APIRouter(
    prefix="/profiles",
    tags=["profiles"]
)



@router.get("/", response_model=List[ProfileReadSchema], status_code=status.HTTP_200_OK)
async def read_profiles(
    db: SessionDep,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = Query(None, description="Поиск по имени/фамилии"),
    cloth_ids: Optional[str] = Query(None, description="Comma-separated list of cloth IDs")
):
    """
    Получить список всех профилей с пагинацией
    """
    cloth_id_list = None
    if cloth_ids:
        cloth_id_list = [int(x) for x in cloth_ids.split(',') if x.isdigit()]
    return await services.read_profiles(db, skip=skip, limit=limit, search=search, cloth_ids=cloth_id_list)


@router.post("/", response_model=ProfileReadSchema, status_code=status.HTTP_201_CREATED)
async def create_profile(
    db: SessionDep,
    profile_in: ProfileCreateSchema
):
    """
    Создать новый профиль
    """
    return await services.create_profile(db, profile_in)


@router.get("/{profile_id}", response_model=ProfileReadSchema, status_code=status.HTTP_200_OK)
async def read_profile(
    db: SessionDep,
    profile_id: int
):
    """
    Получить профиль по ID
    """
    return await services.read_profile(db, profile_id)


@router.patch("/{profile_id}", response_model=ProfileReadSchema, status_code=status.HTTP_200_OK)
async def update_profile(
    db: SessionDep,
    profile_id: int,
    profile_in: ProfileUpdateSchema
):
    """
    Обновить профиль по ID
    """
    return await services.update_profile(db, profile_id, profile_in)


@router.delete("/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_profile(
    db: SessionDep,
    profile_id: int
):
    """
    Удалить профиль по ID
    """
    return await services.delete_profile(db, profile_id)
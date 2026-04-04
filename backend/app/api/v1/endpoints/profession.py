from fastapi import APIRouter, Query, status
from typing import List, Optional

from app.core.database import SessionDep
from app.schemas.profession import (
    ProfessionCreateSchema, 
    ProfessionReadSchema, 
    ProfessionUpdateSchema,
    EmploymentSchema
)
from app import services


router = APIRouter(prefix="/professions", tags=["professions"])


@router.post("/", response_model=ProfessionReadSchema, status_code=status.HTTP_201_CREATED)
async def create_profession(
    db: SessionDep,
    profession_in: ProfessionCreateSchema
):
    """
    Создать новую профессию
    """
    profession = await services.create_profession(db, profession_in)
    return profession


@router.get("/", response_model=List[ProfessionReadSchema])
async def read_professions(
    db: SessionDep,
    skip: int = Query(0, ge=0, description="Пропустить записей"),
    limit: int = Query(100, ge=1, le=1000, description="Лимит записей"),
    search: Optional[str] = Query(None, description="Поиск по названию")
):
    """
    Получить список профессий с поиском
    """
    professions = await services.read_professions(db, skip=skip, limit=limit, search=search)
    return professions


@router.get("/{profession_id}", response_model=ProfessionReadSchema)
async def read_profession(
    db: SessionDep,
    profession_id: int
):
    """
    Получить профессию по ID
    """
    profession = await services.read_profession(db, profession_id)
    return profession


@router.patch("/{profession_id}", response_model=ProfessionReadSchema)
async def update_profession(
    db: SessionDep,
    profession_id: int,
    profession_in: ProfessionUpdateSchema
):
    """
    Обновить профессию
    """
    profession = await services.update_profession(db, profession_id, profession_in)
    return profession


@router.delete("/{profession_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_profession(
    db: SessionDep,
    profession_id: int
):
    """
    Удалить профессию
    """
    await services.delete_profession(db, profession_id)
    return None


# Эндпоинты для работы с employment (связью профиля и профессии)
@router.post("/profile/employment", status_code=status.HTTP_201_CREATED)
async def add_profession_to_profile(
    db: SessionDep,
    employment: EmploymentSchema
):
    """
    Добавить профессию к профилю
    """
    result = await services.add_profession_to_profile(db, employment)
    return result


@router.delete("/profile/{profile_id}/profession/{profession_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_profession_from_profile(
    db: SessionDep,
    profile_id: int,
    profession_id: int
):
    """
    Удалить профессию у профиля
    """
    await services.remove_profession_from_profile(db, profile_id, profession_id)
    return None


@router.get("/profile/{profile_id}/professions")
async def get_profile_professions(
    db: SessionDep,
    profile_id: int
):
    """
    Получить все профессии профиля
    """
    result = await services.get_profile_professions(db, profile_id)
    return result
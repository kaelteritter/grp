from fastapi import APIRouter, Query, status
from typing import List, Optional

from app.core.database import SessionDep
from app.schemas.cloth import ClothCreateSchema, ClothReadSchema, ClothUpdateSchema
from app import services


router = APIRouter(prefix="/clothes", tags=["clothes"])




@router.post("/", response_model=ClothReadSchema, status_code=status.HTTP_201_CREATED)
async def create_cloth(
    db: SessionDep,
    cloth_in: ClothCreateSchema
):
    """
    Создать новый элемент одежды
    """
    return await services.create_cloth(db, cloth_in)



@router.get("/", response_model=List[ClothReadSchema])
async def read_clothes(
    db: SessionDep,
    skip: int = Query(0, ge=0, description="Пропустить записей"),
    limit: int = Query(100, ge=1, le=1000, description="Лимит записей"),
    search: Optional[str] = Query(None, description="Поиск по названию"),
    color: Optional[str] = Query(None, description="Фильтр по цвету"),
    material: Optional[str] = Query(None, description="Фильтр по материалу")
):
    """
    Получить список одежды с фильтрацией
    """
    return await services.read_clothes(db, skip=skip, limit=limit, search=search, color=color, material=material)


@router.get("/{cloth_id}", response_model=ClothReadSchema)
async def read_cloth(
    db: SessionDep,
    cloth_id: int
):
    """
    Получить элемент одежды по ID
    """
    return await services.read_cloth(db, cloth_id)


@router.patch("/{cloth_id}", response_model=ClothReadSchema)
async def update_cloth(
    db: SessionDep,
    cloth_id: int,
    cloth_in: ClothUpdateSchema
):
    """
    Обновить элемент одежды
    """
    return await services.update_cloth(db, cloth_id, cloth_in)


@router.delete("/{cloth_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cloth(
    db: SessionDep,
    cloth_id: int
):
    """
    Удалить элемент одежды
    """
    await services.delete_cloth(db, cloth_id)
    return None


# Эндпоинты для работы со связями
@router.post("/{cloth_id}/photos/{photo_id}", status_code=status.HTTP_200_OK)
async def add_photo_to_cloth(
    db: SessionDep,
    cloth_id: int,
    photo_id: int
):
    """
    Добавить фото к элементу одежды
    """
    return await services.add_photo_to_cloth(db, cloth_id, photo_id)


@router.delete("/{cloth_id}/photos/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_photo_from_cloth(
    db: SessionDep,
    cloth_id: int,
    photo_id: int
):
    """
    Удалить фото из элемента одежды
    """
    await services.remove_photo_from_cloth(db, cloth_id, photo_id)
    return None
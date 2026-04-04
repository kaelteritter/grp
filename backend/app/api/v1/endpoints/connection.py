from fastapi import APIRouter, status
from typing import List

from app.core.database import SessionDep
from app.schemas.profile import ProfileConnectionSchema, ProfileConnectionReadSchema
from app import services


router = APIRouter(prefix="/connections", tags=["connections"])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def add_connection(
    db: SessionDep,
    connection_in: ProfileConnectionSchema
):
    """
    Добавить связь между профилями
    """
    result = await services.add_connection(db, connection_in)
    return result


@router.delete("/{profile_id}/{connected_profile_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_connection(
    db: SessionDep,
    profile_id: int,
    connected_profile_id: int
):
    """
    Удалить связь между профилями
    """
    await services.remove_connection(db, profile_id, connected_profile_id)
    return None


@router.get("/{profile_id}", response_model=List[ProfileConnectionReadSchema])
async def get_profile_connections(
    db: SessionDep,
    profile_id: int
):
    """
    Получить все связи профиля
    """
    connections = await services.get_profile_connections(db, profile_id)
    return connections
from fastapi import APIRouter, status
from typing import List

from app.core.database import SessionDep
from app.schemas.profile import ProfileConnectionCreateSchema, ProfileConnectionReadSchema
from app import services


router = APIRouter(prefix="/connections", tags=["connections"])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def add_connection(
    db: SessionDep,
    connection_in: ProfileConnectionCreateSchema
):
    """
    Добавить связь между профилями
    """
    return await services.create_connection(db, connection_in)


@router.delete("/{profile_id}/{connected_profile_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_connection(
    db: SessionDep,
    profile_id: int,
    connected_profile_id: int
):
    """
    Удалить связь между профилями
    """
    await services.delete_connection_by_profiles_ids(db, profile_id, connected_profile_id)
    return None


@router.get("/{profile_id}", response_model=List[ProfileConnectionReadSchema])
async def read_connections_by_profile_id(
    db: SessionDep,
    profile_id: int
):
    """
    Получить все связи профиля
    """
    connections = await services.read_connections_by_profile_id(db, profile_id)
    return connections
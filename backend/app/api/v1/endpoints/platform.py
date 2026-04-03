# backend/app/api/v1/endpoints/platform.py

from fastapi import APIRouter
from starlette import status

from app.core.database import SessionDep
from app.schemas.platform import PlatformReadSchema, PlatformUpdateSchema, PlatformCreateSchema
from app import services


router = APIRouter(prefix="/platforms", tags=["platforms"])


@router.get("/", response_model=list[PlatformReadSchema])
async def read_platforms(db: SessionDep):
    return await services.read_platforms(db)


@router.get("/{platform_id}", response_model=PlatformReadSchema)
async def read_platform(db: SessionDep, platform_id: int):
    return await services.read_platform(db, platform_id)


@router.post("/", response_model=PlatformReadSchema)
async def create_platform(db: SessionDep, platform_in: PlatformCreateSchema): 
    return await services.create_platform(db, platform_in)


@router.patch("/{platform_id}", response_model=PlatformReadSchema)
async def update_platform(db: SessionDep, platform_id: int, platform_in: PlatformUpdateSchema):
    return await services.update_platform(db, platform_id, platform_in)


@router.delete("/{platform_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_platform(db: SessionDep, platform_id: int):
    await services.delete_platform(db, platform_id)
    return {
        "id": platform_id,
        "message": "Платформа успешно удалена"
    }
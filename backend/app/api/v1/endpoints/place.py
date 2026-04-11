from fastapi import APIRouter, Query, status
from typing import List, Optional

from app.core.database import SessionDep
from app.schemas.place import PlaceCreateSchema, PlaceReadSchema, PlaceUpdateSchema
from app import services

router = APIRouter(prefix="/places", tags=["places"])


@router.post("/", response_model=PlaceReadSchema, status_code=status.HTTP_201_CREATED)
async def create_place(db: SessionDep, place_in: PlaceCreateSchema):
    return await services.create_place(db, place_in)


@router.get("/", response_model=List[PlaceReadSchema])
async def read_places(
    db: SessionDep,
    address_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    return await services.read_places(db, address_id=address_id, search=search, skip=skip, limit=limit)


@router.get("/{place_id}", response_model=PlaceReadSchema)
async def read_place(db: SessionDep, place_id: int):
    return await services.read_place(db, place_id)


@router.patch("/{place_id}", response_model=PlaceReadSchema)
async def update_place(db: SessionDep, place_id: int, place_in: PlaceUpdateSchema):
    return await services.update_place(db, place_id, place_in)


@router.delete("/{place_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_place(db: SessionDep, place_id: int):
    await services.delete_place(db, place_id)
    return None
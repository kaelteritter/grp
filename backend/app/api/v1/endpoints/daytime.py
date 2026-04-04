from fastapi import APIRouter, Query, status
from typing import List, Optional

from app.core.database import SessionDep
from app.schemas.daytime import DayTimeCreateSchema, DayTimeReadSchema, DayTimeUpdateSchema
from app import services


router = APIRouter(prefix="/daytimes", tags=["daytimes"])


@router.post("/", response_model=DayTimeReadSchema, status_code=status.HTTP_201_CREATED)
async def create_daytime(
    db: SessionDep,
    daytime_in: DayTimeCreateSchema
):
    return await services.create_daytime(db, daytime_in)


@router.get("/", response_model=List[DayTimeReadSchema])
async def read_daytimes(
    db: SessionDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    return await services.read_daytimes(db, skip=skip, limit=limit)


@router.get("/{daytime_id}", response_model=DayTimeReadSchema)
async def read_daytime(
    db: SessionDep,
    daytime_id: int
):
    return await services.read_daytime(db, daytime_id)


@router.patch("/{daytime_id}", response_model=DayTimeReadSchema)
async def update_daytime(
    db: SessionDep,
    daytime_id: int,
    daytime_in: DayTimeUpdateSchema
):
    return await services.update_daytime(db, daytime_id, daytime_in)


@router.delete("/{daytime_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_daytime(
    db: SessionDep,
    daytime_id: int
):
    await services.delete_daytime(db, daytime_id)
    return None
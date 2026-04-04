from fastapi import APIRouter, Query, status
from typing import List, Optional

from app.core.database import SessionDep
from app.schemas.season import SeasonCreateSchema, SeasonReadSchema, SeasonUpdateSchema
from app import services


router = APIRouter(prefix="/seasons", tags=["seasons"])


@router.post("/", response_model=SeasonReadSchema, status_code=status.HTTP_201_CREATED)
async def create_season(
    db: SessionDep,
    season_in: SeasonCreateSchema
):
    return await services.create_season(db, season_in)


@router.get("/", response_model=List[SeasonReadSchema])
async def read_seasons(
    db: SessionDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    return await services.read_seasons(db, skip=skip, limit=limit)


@router.get("/{season_id}", response_model=SeasonReadSchema)
async def read_season(
    db: SessionDep,
    season_id: int
):
    return await services.read_season(db, season_id)


@router.patch("/{season_id}", response_model=SeasonReadSchema)
async def update_season(
    db: SessionDep,
    season_id: int,
    season_in: SeasonUpdateSchema
):
    return await services.update_season(db, season_id, season_in)


@router.delete("/{season_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_season(
    db: SessionDep,
    season_id: int
):
    await services.delete_season(db, season_id)
    return None
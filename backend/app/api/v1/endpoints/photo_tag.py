from fastapi import APIRouter, Query, status
from typing import List, Optional

from app.core.database import SessionDep
from app.schemas.photo_tag import PhotoTagCreateSchema, PhotoTagReadSchema, PhotoTagUpdateSchema
from app import services


router = APIRouter(prefix="/photo-tags", tags=["photo-tags"])


@router.post("/", response_model=PhotoTagReadSchema, status_code=status.HTTP_201_CREATED)
async def create_photo_tag(
    db: SessionDep,
    tag_in: PhotoTagCreateSchema
):
    tag = await services.create_photo_tag(db, tag_in)
    return tag


@router.get("/", response_model=List[PhotoTagReadSchema])
async def read_photo_tags(
    db: SessionDep,
    photo_id: Optional[int] = Query(None),
    profile_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    tags = await services.read_photo_tags(db, photo_id=photo_id, profile_id=profile_id, skip=skip, limit=limit)
    return tags


@router.get("/{tag_id}", response_model=PhotoTagReadSchema)
async def read_photo_tag(
    db: SessionDep,
    tag_id: int
):
    tag = await services.read_photo_tag(db, tag_id)
    return tag


@router.patch("/{tag_id}", response_model=PhotoTagReadSchema)
async def update_photo_tag(
    db: SessionDep,
    tag_id: int,
    tag_in: PhotoTagUpdateSchema
):
    tag = await services.update_photo_tag(db, tag_id, tag_in)
    return tag


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_photo_tag(
    db: SessionDep,
    tag_id: int
):
    await services.delete_photo_tag(db, tag_id)
    return None
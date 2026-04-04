from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile, status
from typing import List, Optional

from app.core.database import SessionDep
from app.schemas.video import VideoCreateSchema, VideoReadSchema, VideoUpdateSchema
from app import services


router = APIRouter(prefix="/videos", tags=["videos"])


def enrich_video(video):
    """Преобразует модель Video в Pydantic схему"""
    return VideoReadSchema.model_validate(video, from_attributes=True)


@router.post("/", response_model=VideoReadSchema, status_code=status.HTTP_201_CREATED)
async def create_video(
    db: SessionDep,
    video_in: VideoCreateSchema
):
    """
    Создать новое видео
    """
    video = await services.create_video(db, video_in)
    return enrich_video(video)


@router.get("/", response_model=List[VideoReadSchema])
async def read_videos(
    db: SessionDep,
    profile_id: Optional[int] = Query(None, description="Фильтр по ID профиля"),
    skip: int = Query(0, ge=0, description="Пропустить записей"),
    limit: int = Query(100, ge=1, le=1000, description="Лимит записей")
):
    """
    Получить список видео с фильтрацией по профилю
    """
    videos = await services.read_videos(db, profile_id=profile_id, skip=skip, limit=limit)
    return [enrich_video(video) for video in videos]


@router.get("/{video_id}", response_model=VideoReadSchema)
async def read_video(
    db: SessionDep,
    video_id: int
):
    """
    Получить видео по ID
    """
    video = await services.read_video(db, video_id)
    return enrich_video(video)


@router.patch("/{video_id}", response_model=VideoReadSchema)
async def update_video(
    db: SessionDep,
    video_id: int,
    video_in: VideoUpdateSchema
):
    """
    Обновить видео
    """
    video = await services.update_video(db, video_id, video_in)
    return enrich_video(video)


@router.delete("/{video_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_video(
    db: SessionDep,
    video_id: int
):
    """
    Удалить видео
    """
    await services.delete_video(db, video_id)
    return None


@router.patch("/profile/{profile_id}/cover/{video_id}", response_model=VideoReadSchema)
async def set_profile_cover(
    db: SessionDep,
    profile_id: int,
    video_id: int
):
    """
    Установить видео как обложку профиля
    """
    video = await services.set_cover(db, profile_id, video_id)
    return enrich_video(video)


@router.post("/multiple/", response_model=List[VideoReadSchema], status_code=status.HTTP_201_CREATED)
async def upload_multiple_videos(
    db: SessionDep,
    files: List[UploadFile] = File(...),
    profile_id: int = Form(...)
):
    """
    Загрузить несколько видео в S3-подобное хранилище
    """
    videos = await services.create_videos(db, files, profile_id)
    return videos
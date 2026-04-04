from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

from app.schemas.cloth import ClothForPhotoReadSchema


class PhotoBaseSchema(BaseModel):
    url: str = Field(..., max_length=500)
    title: Optional[str] = Field(None, max_length=255)
    is_avatar: bool = False
    sort_order: int = 0


class PhotoCreateSchema(PhotoBaseSchema):
    profile_id: int


class PhotoUpdateSchema(BaseModel):
    url: Optional[str] = Field(None, max_length=500)
    title: Optional[str] = Field(None, max_length=255)
    is_avatar: Optional[bool] = None
    sort_order: Optional[int] = Field(None, ge=0)


class PhotoReadSchema(PhotoBaseSchema):
    id: int
    profile_id: int
    created_at: datetime
    clothes: Optional[List[ClothForPhotoReadSchema]] = []


class PhotoForProfileReadSchema(BaseModel):
    id: int
    url: str
    title: Optional[str] = None
    is_avatar: bool
    sort_order: int
    created_at: datetime
    clothes: Optional[List[ClothForPhotoReadSchema]] = [] 
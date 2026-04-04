from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, field_validator, ConfigDict


class VideoBaseSchema(BaseModel):
    url: str = Field(..., max_length=500)
    title: Optional[str] = Field(None, max_length=255)
    thumbnail_url: Optional[str] = Field(None, max_length=500)
    duration: int = Field(0, ge=0)
    is_cover: bool = False
    sort_order: int = Field(0, ge=0)

    @field_validator('url')
    @classmethod
    def validate_url(cls, v):
        if not v or not v.strip():
            raise ValueError("URL видео не может быть пустым")
        if len(v) > 500:
            raise ValueError("URL не может быть длиннее 500 символов")
        return v.strip()

    @field_validator('thumbnail_url')
    @classmethod
    def validate_thumbnail_url(cls, v):
        if v is not None:
            if not v.strip():
                raise ValueError("URL превью не может быть пустым")
            if len(v) > 500:
                raise ValueError("URL превью не может быть длиннее 500 символов")
            return v.strip()
        return v

    @field_validator('duration')
    @classmethod
    def validate_duration(cls, v):
        if v < 0:
            raise ValueError("Длительность не может быть отрицательной")
        return v


class VideoCreateSchema(VideoBaseSchema):
    profile_id: int


class VideoUpdateSchema(BaseModel):
    url: Optional[str] = Field(None, max_length=500)
    title: Optional[str] = Field(None, max_length=255)
    thumbnail_url: Optional[str] = Field(None, max_length=500)
    duration: Optional[int] = Field(None, ge=0)
    is_cover: Optional[bool] = None
    sort_order: Optional[int] = Field(None, ge=0)

    @field_validator('url')
    @classmethod
    def validate_url(cls, v):
        if v is not None:
            if not v or not v.strip():
                raise ValueError("URL видео не может быть пустым")
            if len(v) > 500:
                raise ValueError("URL не может быть длиннее 500 символов")
            return v.strip()
        return v

    @field_validator('thumbnail_url')
    @classmethod
    def validate_thumbnail_url(cls, v):
        if v is not None:
            if not v.strip():
                raise ValueError("URL превью не может быть пустым")
            if len(v) > 500:
                raise ValueError("URL превью не может быть длиннее 500 символов")
            return v.strip()
        return v


class VideoReadSchema(VideoBaseSchema):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    profile_id: int
    created_at: datetime


# Схема для использования внутри Profile (без profile_id, чтобы избежать цикла)
class VideoForProfileReadSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    url: str
    title: Optional[str] = None
    thumbnail_url: Optional[str] = None
    duration: int
    is_cover: bool
    sort_order: int
    created_at: datetime
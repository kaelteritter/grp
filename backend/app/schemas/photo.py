# backend/app/schemas/photo.py

from typing import TYPE_CHECKING, Annotated, Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

from app.schemas.cloth import ClothReadSchema
from app.schemas.place import PlaceReadSchema
from app.schemas.season import SeasonReadSchema
from app.schemas.daytime import DayTimeReadSchema
from app.schemas.event import EventReadSchema
from app.schemas.photo_tag import SimplePhotoTagSchema


class PhotoBaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, str_strip_whitespace=True)


class PhotoCreateSchema(PhotoBaseSchema):
    profile_id: Annotated[int, Field(..., ge=1)]
    url: Annotated[str, Field(..., min_length=1, max_length=500)]
    title: Annotated[str | None, Field(None, min_length=1, max_length=255)]
    is_avatar: Annotated[bool, Field(False)]
    sort_order: Annotated[int, Field(0)]
    rating: Annotated[float | None, Field(None, ge=1, le=10)]
    season_id: Annotated[int | None, Field(None)]
    daytime_id: Annotated[int | None, Field(None)]
    event_id: Annotated[int | None, Field(None)]
    place_id: Annotated[int | None, Field(None)]


class PhotoUpdateSchema(PhotoBaseSchema):
    profile_id: Annotated[int | None, Field(None, ge=1)]
    url: Annotated[str | None, Field(None, min_length=1, max_length=500)]
    title: Annotated[str | None, Field(None, min_length=1, max_length=255)]
    is_avatar: Annotated[bool, Field(False)]
    sort_order: Annotated[int, Field(0)]
    rating: Annotated[float | None, Field(None, ge=1, le=10)]
    season_id: Annotated[int | None, Field(None)]
    daytime_id: Annotated[int | None, Field(None)]
    event_id: Annotated[int | None, Field(None)]
    place_id: Annotated[int | None, Field(None)]
    cloth_ids: Annotated[list[int], Field(default_factory=list)]


class PhotoReadSchema(PhotoBaseSchema):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    url: str
    title: Optional[str]
    is_avatar: bool
    sort_order: int
    rating: Optional[float]
    profile_id: int
    created_at: datetime
    season: Optional[SeasonReadSchema] = None
    daytime: Optional[DayTimeReadSchema] = None
    event: Optional[EventReadSchema] = None
    place: Optional[PlaceReadSchema] = None
    tags: Optional[List[SimplePhotoTagSchema]] = []
    clothes: Optional[List[ClothReadSchema]] = []


class PhotoForProfileReadSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    url: str
    title: Optional[str] = None
    is_avatar: bool
    sort_order: int
    created_at: datetime
    rating: Optional[float] = None
    season: Optional[SeasonReadSchema] = None
    daytime: Optional[DayTimeReadSchema] = None
    event: Optional[EventReadSchema] = None
    place: Optional[PlaceReadSchema] = None

# Простая схема для использования внутри Cloth
class SimplePhotoSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    url: str
    title: Optional[str] = None
    is_avatar: bool
    sort_order: int
    created_at: datetime
    rating: Optional[float] = None


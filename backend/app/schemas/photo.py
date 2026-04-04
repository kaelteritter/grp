from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, field_validator, ConfigDict

from app.schemas.cloth import ClothForPhotoReadSchema
from app.schemas.season import SeasonReadSchema
from app.schemas.daytime import DayTimeReadSchema
from app.schemas.event import EventReadSchema
from app.schemas.address import AddressReadSchema


class PhotoBaseSchema(BaseModel):
    url: str = Field(..., max_length=500)
    title: Optional[str] = Field(None, max_length=255)
    is_avatar: bool = False
    sort_order: int = 0
    rating: Optional[float] = Field(None, ge=1, le=10)
    season_id: Optional[int] = None
    daytime_id: Optional[int] = None
    event_id: Optional[int] = None
    address_id: Optional[int] = None

    @field_validator('url')
    @classmethod
    def validate_url(cls, v):
        if not v or not v.strip():
            raise ValueError("URL фото не может быть пустым")
        if len(v) > 500:
            raise ValueError("URL не может быть длиннее 500 символов")
        return v.strip()


class PhotoCreateSchema(PhotoBaseSchema):
    profile_id: int


class PhotoUpdateSchema(BaseModel):
    url: Optional[str] = Field(None, max_length=500)
    title: Optional[str] = Field(None, max_length=255)
    is_avatar: Optional[bool] = None
    sort_order: Optional[int] = Field(None, ge=0)
    rating: Optional[float] = Field(None, ge=1, le=10)
    season_id: Optional[int] = None
    daytime_id: Optional[int] = None
    event_id: Optional[int] = None
    address_id: Optional[int] = None


class PhotoReadSchema(PhotoBaseSchema):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    profile_id: int
    created_at: datetime
    clothes: Optional[List[ClothForPhotoReadSchema]] = []
    season: Optional[SeasonReadSchema] = None
    daytime: Optional[DayTimeReadSchema] = None
    event: Optional[EventReadSchema] = None
    address: Optional[AddressReadSchema] = None


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
    address: Optional[AddressReadSchema] = None
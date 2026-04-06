from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class SimplePhotoForTagSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    url: str
    title: Optional[str] = None
    is_avatar: bool
    sort_order: int
    created_at: datetime

class ProfileForTagReadSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    photos: Optional[List[SimplePhotoForTagSchema]] = []

class PhotoTagBaseSchema(BaseModel):
    x: float = Field(..., ge=0, le=1)
    y: float = Field(..., ge=0, le=1)

class PhotoTagCreateSchema(PhotoTagBaseSchema):
    photo_id: int
    profile_id: int

class PhotoTagUpdateSchema(BaseModel):
    x: Optional[float] = Field(None, ge=0, le=1)
    y: Optional[float] = Field(None, ge=0, le=1)

class PhotoTagReadSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    photo_id: int
    profile_id: int
    profile: ProfileForTagReadSchema
    x: float
    y: float
    created_at: datetime

class SimplePhotoTagSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    x: float
    y: float
    profile_id: int
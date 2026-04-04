from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

if TYPE_CHECKING:
    from app.schemas.profile import ProfileReadSchema
    from app.schemas.photo import SimplePhotoSchema


class PhotoTagBaseSchema(BaseModel):
    x: float = Field(..., ge=0, le=1, description="Координата X (0-1)")
    y: float = Field(..., ge=0, le=1, description="Координата Y (0-1)")


class PhotoTagCreateSchema(PhotoTagBaseSchema):
    photo_id: int
    profile_id: int


class PhotoTagUpdateSchema(BaseModel):
    x: Optional[float] = Field(None, ge=0, le=1)
    y: Optional[float] = Field(None, ge=0, le=1)


class PhotoTagReadSchema(PhotoTagBaseSchema):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    photo_id: int
    profile_id: int
    created_at: datetime
    # profile и photo убраны - будем получать отдельно


# Простая схема для использования внутри Photo (без циклических ссылок)
class SimplePhotoTagSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    x: float
    y: float
    profile_id: int
    # profile убран - только ID
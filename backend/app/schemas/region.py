from typing import Optional
from pydantic import BaseModel, Field, field_validator, ConfigDict

from app.schemas.country import CountryReadSchema


class RegionReadSchema(BaseModel):
    id: int
    name: str
    country: Optional[CountryReadSchema] = None  # Сделаем поле опциональным
    
    model_config = ConfigDict(from_attributes=True)


class RegionCreateSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    country_id: Optional[int] = Field(None, ge=1)
    
    @field_validator('name')
    @classmethod
    def validate_name_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Название региона не может быть пустым")
        return v.strip()


class RegionUpdateSchema(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    country_id: Optional[int] = Field(None, ge=1)
    
    @field_validator('name')
    @classmethod
    def validate_name_not_empty(cls, v):
        if v is not None:
            if not v or not v.strip():
                raise ValueError("Название региона не может быть пустым")
            return v.strip()
        return v
# backend/app/schemas/region.py

from typing import Optional
from pydantic import BaseModel, Field, field_validator


class RegionReadSchema(BaseModel):
    id: int
    name: str
    country_id: Optional[int] = None
    country_name: Optional[str] = None  # Для удобства отображения
    
    class Config:
        from_attributes = True


class RegionCreateSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    country_id: Optional[int] = Field(None, ge=1)
    
    @field_validator('name')
    @classmethod
    def validate_name_not_empty(cls, v):
        """Проверка, что имя не пустое и не состоит из пробелов"""
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
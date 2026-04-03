# backend/app/schemas/location.py

from typing import Optional
from pydantic import BaseModel, Field, field_validator


class LocationReadSchema(BaseModel):
    id: int
    name: str
    region_id: Optional[int] = None
    region_name: Optional[str] = None
    country_id: Optional[int] = None
    country_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    

class LocationCreateSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    region_id: Optional[int] = Field(None, ge=1)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    
    @field_validator('name')
    @classmethod
    def validate_name_not_empty(cls, v):
        """Проверка, что имя не пустое и не состоит из пробелов"""
        if not v or not v.strip():
            raise ValueError("Название локации не может быть пустым")
        return v.strip()
    

class LocationUpdateSchema(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    region_id: Optional[int] = Field(None, ge=1)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    
    
    @field_validator('name')
    @classmethod
    def validate_name_not_empty(cls, v):
        if v is not None:
            if not v or not v.strip():
                raise ValueError("Название локации не может быть пустым")
            return v.strip()
        return v
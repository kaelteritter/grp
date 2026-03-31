# backend/app/schemas/country.py

from typing import Optional
from pydantic import BaseModel, Field, field_validator


class CountryReadSchema(BaseModel):
    id: int
    name: str


class CountryCreateSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)

    @field_validator('name')
    @classmethod
    def validate_name_not_empty(cls, v):
        """Проверка, что имя не пустое и не состоит из пробелов"""
        if not v or not v.strip():
            raise ValueError("Название страны не может быть пустым")
        return v.strip()


class CountryUpdateSchema(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    
    @field_validator('name')
    @classmethod
    def validate_name_not_empty(cls, v):
        if v is not None:
            if not v or not v.strip():
                raise ValueError("Название страны не может быть пустым")
            return v.strip()
        return v
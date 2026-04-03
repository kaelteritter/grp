# backend/app/schemas/platform.py


from typing import Optional

from pydantic import BaseModel, field_validator


class PlatformReadSchema(BaseModel):
    id: int
    name: str
    base_url: str


class PlatformCreateSchema(BaseModel):
    name: str
    base_url: str

    @field_validator("base_url")
    @classmethod
    def validate_base_url(cls, value):
        if not value or not value.strip():
            raise ValueError("base_url не может быть пустым")
        return value

    @field_validator("name")
    @classmethod
    def validate_name(cls, value):
        if not value or not value.strip():
            raise ValueError("name не может быть пустым")
        return value


class PlatformUpdateSchema(BaseModel):
    name: Optional[str] = None
    base_url: Optional[str] = None

    @field_validator("base_url")
    @classmethod
    def validate_base_url(cls, value):
        if value == "":
            raise ValueError("base_url не может быть пустым")
        return value
    
    @field_validator("name")
    @classmethod
    def validate_name(cls, value):
        if not value or not value.strip():
            raise ValueError("name не может быть пустым")
        return value

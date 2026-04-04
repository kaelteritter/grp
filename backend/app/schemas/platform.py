# backend/app/schemas/platform.py


from typing import Optional
from pydantic import BaseModel, field_validator

class PlatformBaseSchema(BaseModel):
    @field_validator("base_url", check_fields=False)
    @classmethod
    def validate_base_url(cls, value):
        if not value or not value.strip():
            raise ValueError("base_url не может быть пустым")
        return value

    @field_validator("name", check_fields=False)
    @classmethod
    def validate_name(cls, value):
        if not value or not value.strip():
            raise ValueError("name не может быть пустым")
        return value
    
    @field_validator("icon_url", check_fields=False)
    @classmethod
    def validate_icon_url(cls, value):
        if value is not None and not value.strip():
            raise ValueError("icon_url не может быть пустым, если указано")
        return value


class PlatformReadSchema(BaseModel):
    id: int
    name: str
    base_url: str
    icon_url: Optional[str] = None


class PlatformCreateSchema(PlatformBaseSchema):
    name: str
    base_url: str
    icon_url: Optional[str] = None


class PlatformUpdateSchema(PlatformBaseSchema):
    name: Optional[str] = None
    base_url: Optional[str] = None
    icon_url: Optional[str] = None
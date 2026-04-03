# backend/app/schemas/link.py

from typing import Optional
from pydantic import BaseModel, field_validator

from app.schemas.platform import PlatformReadSchema




class LinkBaseSchema(BaseModel):
    @field_validator("url", check_fields=False)
    @classmethod
    def validate_url(cls, value):
        if not value or not value.strip():
            raise ValueError("url не может быть пустым")
        if len(value) > 255:
            raise ValueError("URL не может быть длиннее 255 символов")
        return value


class LinkReadSchema(BaseModel):
    id: int
    url: str
    platform: PlatformReadSchema
    profile_id: int


class LinkCreateSchema(LinkBaseSchema):
    url: str
    platform_id: int
    profile_id: int


class LinkUpdateSchema(LinkBaseSchema):
    url: Optional[str] = None
    platform_id: Optional[int] = None
    profile_id: Optional[int] = None



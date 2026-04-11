# backend/app/schemas/place.py

from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.address import AddressReadSchema


class PlaceBaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, str_strip_whitespace=True)


class PlaceCreateSchema(BaseModel):
    name: Annotated[str, Field(..., min_length=1, max_length=255)]
    address_id: Annotated[int, Field(..., ge=1)]


class PlaceReadSchema(PlaceBaseSchema):
    id: int
    name: str
    address: AddressReadSchema


class PlaceUpdateSchema(BaseModel):
    name: Annotated[str | None, Field(None, min_length=1, max_length=255)]
    address_id: Annotated[int | None, Field(None, ge=1)]
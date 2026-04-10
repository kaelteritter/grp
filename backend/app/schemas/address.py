from typing import Annotated, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.location import LocationReadSchema


class AddressBaseSchema(BaseModel):
    """
    Базовые проверки и создание модели из атрибутов
    """
    model_config = ConfigDict(
        from_attributes=True,
        str_strip_whitespace=True,
    )


class AddressCreateSchema(AddressBaseSchema):
    street: Annotated[str | None, Field(min_length=1, max_length=255)]
    house: Annotated[str | None, Field(min_length=1, max_length=100)]
    location_id: Annotated[int | None, Field(None, ge=1)]


class AddressUpdateSchema(AddressBaseSchema):
    street: Annotated[str | None, Field(None, min_length=1, max_length=255)]
    house: Annotated[str | None, Field(None, min_length=1, max_length=100)]
    location_id: Annotated[int | None, Field(None, ge=1)]


class AddressReadSchema(AddressBaseSchema):
    id: int
    street: Annotated[str | None, Field(min_length=1, max_length=255)]
    house: Annotated[str | None, Field(min_length=1, max_length=100)]
    location_id: Annotated[int | None, Field(None, ge=1)]
    location: Annotated[LocationReadSchema | None, Field(None)]


class AddressForProfileReadSchema(AddressBaseSchema):
    id: int
    street: Annotated[str | None, Field(min_length=1, max_length=255)]
    house: Annotated[str | None, Field(min_length=1, max_length=100)]
    location: Annotated[LocationReadSchema | None, Field(None)]

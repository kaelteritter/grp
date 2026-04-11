# backend/app/schemas/country.py

from typing import Annotated
from pydantic import BaseModel, ConfigDict, Field


class CountryBaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, str_strip_whitespace=True)


class CountryReadSchema(CountryBaseSchema):
    id: int
    name: str


class CountryCreateSchema(CountryBaseSchema):
    name: Annotated[str, Field(..., min_length=1, max_length=255)]


class CountryUpdateSchema(CountryBaseSchema):
    name: Annotated[str | None, Field(None, min_length=1, max_length=255)]
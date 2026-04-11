from typing import Annotated
from pydantic import BaseModel, Field, ConfigDict

from app.schemas.country import CountryReadSchema


class RegionBaseModel(BaseModel):
    """
    Базовые проверки и создание модели из атрибутов
    """
    model_config = ConfigDict(from_attributes=True, str_strip_whitespace=True)


class RegionReadSchema(RegionBaseModel):
    id: int
    name: str
    country: Annotated[CountryReadSchema | None, Field(None)]


class RegionCreateSchema(RegionBaseModel):
    name: Annotated[str, Field(None, min_length=1, max_length=255)]
    country_id: Annotated[int, Field(None, ge=1)]
    

class RegionUpdateSchema(RegionBaseModel):
    name: Annotated[str | None, Field(None, min_length=1, max_length=255)]
    country_id: Annotated[int | None, Field(None, ge=1)]
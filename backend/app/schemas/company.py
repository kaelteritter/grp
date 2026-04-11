from typing import Annotated, Optional, List
from pydantic import BaseModel, ConfigDict, Field

from app.schemas.address import AddressReadSchema


class CompanyBaseSchema(BaseModel):
    """
    Базовые проверки и создание модели из атрибутов
    """
    model_config = ConfigDict(from_attributes=True, str_strip_whitespace=True)


class CompanyCreateSchema(CompanyBaseSchema):
    name: Annotated[str, Field(..., min_length=1, max_length=255)]
    address_ids: Optional[List[int]] = Field(default_factory=list, description="Список ID адресов")


class CompanyUpdateSchema(CompanyBaseSchema):
    name: Annotated[str | None, Field(None, min_length=1, max_length=255)]
    address_ids: Optional[List[int]] = Field(default_factory=list, description="Список ID адресов")


class CompanyReadSchema(CompanyBaseSchema):
    id: int
    name: str
    addresses: Optional[List[AddressReadSchema]] = []


from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.address import AddressReadSchema


class CompanyBaseSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if not v or not v.strip():
            raise ValueError("Название компании не может быть пустым")
        return v.strip()


class CompanyCreateSchema(CompanyBaseSchema):
    address_ids: Optional[List[int]] = Field(None, description="Список ID адресов")


class CompanyUpdateSchema(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    address_ids: Optional[List[int]] = Field(None, description="Список ID адресов")

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if v is not None and not v.strip():
            raise ValueError("Название компании не может быть пустым")
        return v.strip() if v else None


class CompanyReadSchema(CompanyBaseSchema):
    id: int
    addresses: Optional[List[AddressReadSchema]] = []

    model_config = ConfigDict(from_attributes=True)

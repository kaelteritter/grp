from typing import Optional
from pydantic import BaseModel, Field, field_validator

from app.schemas.location import LocationReadSchema


class AddressBaseSchema(BaseModel):
    street: Optional[str] = Field(None, max_length=255)
    house: Optional[str] = Field(None, max_length=100)
    location_id: Optional[int] = Field(None, ge=1)

    @field_validator('street')
    @classmethod
    def validate_street(cls, v):
        if v is not None and not v.strip():
            raise ValueError("Улица не может быть пустой строкой")
        return v.strip() if v else None

    @field_validator('house')
    @classmethod
    def validate_house(cls, v):
        if v is not None and not v.strip():
            raise ValueError("Номер дома не может быть пустой строкой")
        return v.strip() if v else None


class AddressCreateSchema(AddressBaseSchema):
    pass


class AddressUpdateSchema(BaseModel):
    street: Optional[str] = Field(None, max_length=255)
    house: Optional[str] = Field(None, max_length=100)
    location_id: Optional[int] = Field(None, ge=1)

    @field_validator('street')
    @classmethod
    def validate_street(cls, v):
        if v is not None and not v.strip():
            raise ValueError("Улица не может быть пустой строкой")
        return v.strip() if v else None

    @field_validator('house')
    @classmethod
    def validate_house(cls, v):
        if v is not None and not v.strip():
            raise ValueError("Номер дома не может быть пустой строкой")
        return v.strip() if v else None


class AddressReadSchema(AddressBaseSchema):
    id: int
    location: Optional[LocationReadSchema] = None

    model_config = {
        "from_attributes": True
    }


class AddressForProfileReadSchema(BaseModel):
    id: int
    street: Optional[str] = None
    house: Optional[str] = None
    location: Optional[LocationReadSchema] = None

    model_config = {
        "from_attributes": True
    }
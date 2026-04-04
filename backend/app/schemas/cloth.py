from typing import Optional, List
from pydantic import BaseModel, Field, field_validator, ConfigDict


class ClothBaseSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    color: str = Field(..., min_length=1, max_length=255)
    material: str = Field(..., min_length=1, max_length=255)

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if not v or not v.strip():
            raise ValueError("Название одежды не может быть пустым")
        return v.strip()

    @field_validator('color')
    @classmethod
    def validate_color(cls, v):
        if not v or not v.strip():
            raise ValueError("Цвет не может быть пустым")
        return v.strip()

    @field_validator('material')
    @classmethod
    def validate_material(cls, v):
        if not v or not v.strip():
            raise ValueError("Материал не может быть пустым")
        return v.strip()


class ClothCreateSchema(ClothBaseSchema):
    photo_ids: Optional[List[int]] = Field(None, description="Список ID фото")


class ClothUpdateSchema(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    color: Optional[str] = Field(None, min_length=1, max_length=255)
    material: Optional[str] = Field(None, min_length=1, max_length=255)
    photo_ids: Optional[List[int]] = Field(None, description="Список ID фото")

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if v is not None and not v.strip():
            raise ValueError("Название одежды не может быть пустым")
        return v.strip() if v else None

    @field_validator('color')
    @classmethod
    def validate_color(cls, v):
        if v is not None and not v.strip():
            raise ValueError("Цвет не может быть пустым")
        return v.strip() if v else None

    @field_validator('material')
    @classmethod
    def validate_material(cls, v):
        if v is not None and not v.strip():
            raise ValueError("Материал не может быть пустым")
        return v.strip() if v else None


class ClothReadSchema(ClothBaseSchema):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    photo_count: Optional[int] = 0


# Схема для использования внутри Photo (без photo_ids, чтобы избежать цикла)
class ClothForPhotoReadSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    color: str
    material: str
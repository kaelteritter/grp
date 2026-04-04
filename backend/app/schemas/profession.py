from typing import Optional, List
from pydantic import BaseModel, Field, field_validator, ConfigDict


class ProfessionBaseSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if not v or not v.strip():
            raise ValueError("Название профессии не может быть пустым")
        return v.strip()


class ProfessionCreateSchema(ProfessionBaseSchema):
    pass


class ProfessionUpdateSchema(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if v is not None and not v.strip():
            raise ValueError("Название профессии не может быть пустым")
        return v.strip() if v else None


class ProfessionReadSchema(ProfessionBaseSchema):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    profile_count: Optional[int] = 0


# Схема для employment (связи профессии с профилем)
class EmploymentSchema(BaseModel):
    profile_id: int
    profession_id: int
    company_id: Optional[int] = None
    start_year: Optional[int] = Field(None, ge=1900, le=2026)
    end_year: Optional[int] = Field(None, ge=1900, le=2026)
    is_current: bool = False

    @field_validator('end_year')
    @classmethod
    def validate_years(cls, v, info):
        start_year = info.data.get('start_year')
        if start_year and v and v < start_year:
            raise ValueError("Год окончания не может быть меньше года начала")
        return v


class ProfileEmploymentSchema(BaseModel):
    profession: ProfessionReadSchema
    company_id: Optional[int] = None
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    is_current: bool = False
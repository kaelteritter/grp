from enum import Enum
from pydantic import BaseModel, Field, field_validator, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING

from app.schemas.location import LocationReadSchema
from app.schemas.link import LinkReadSchema
from app.schemas.photo import PhotoForProfileReadSchema
from app.schemas.video import VideoForProfileReadSchema

if TYPE_CHECKING:
    from app.schemas.profile import ProfileReadSchema


class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"


class ProfileBaseSchema(BaseModel):
    first_name: Optional[str] = Field(None, max_length=255)
    middle_name: Optional[str] = Field(None, max_length=255)
    last_name: Optional[str] = Field(None, max_length=255)
    sex: Gender = Gender.MALE
    birth_year: Optional[int] = Field(None, ge=1900, le=datetime.now().year)
    birth_month: Optional[int] = Field(None, ge=1, le=12)
    birth_day: Optional[int] = Field(None, ge=1, le=31)
    current_location_id: Optional[int] = Field(None, ge=1)
    email: Optional[EmailStr] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    hair_color: Optional[str] = Field(None, max_length=50)

    @field_validator('birth_year')
    @classmethod
    def validate_birth_year_not_future(cls, v):
        if v is not None:
            current_year = datetime.now().year
            if v > current_year:
                raise ValueError(f"Год рождения не может быть в будущем (максимум {current_year})")
        return v
    
    @field_validator('birth_day', 'birth_month', 'birth_year')
    @classmethod
    def validate_complete_date(cls, v, info):
        values = info.data
        year = values.get('birth_year') if info.field_name != 'birth_year' else v
        month = values.get('birth_month') if info.field_name != 'birth_month' else v
        day = values.get('birth_day') if info.field_name != 'birth_day' else v
        
        if None in [year, month, day]:
            return v
        
        days_in_month = {
            1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30,
            7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31
        }
        
        if (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0):
            days_in_month[2] = 29
        
        if day > days_in_month[month]:
            raise ValueError(f"В месяце {month} нет {day} дня")
        
        return v
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        if v is not None:
            import re
            phone_pattern = re.compile(r'^[\+\d\s\-\(\)]+$')
            if not phone_pattern.match(v):
                raise ValueError("Неверный формат телефона")
        return v


class ProfileReadSchema(ProfileBaseSchema):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime
    updated_at: datetime
    current_location: Optional[LocationReadSchema] = None
    links: Optional[List[LinkReadSchema]] = []
    photos: Optional[List[PhotoForProfileReadSchema]] = []
    videos: Optional[List[VideoForProfileReadSchema]] = []


class ProfileCreateSchema(ProfileBaseSchema):
    pass


class ProfileUpdateSchema(BaseModel):
    first_name: Optional[str] = Field(None, max_length=255)
    middle_name: Optional[str] = Field(None, max_length=255)
    last_name: Optional[str] = Field(None, max_length=255)
    sex: Optional[Gender] = None
    birth_year: Optional[int] = Field(None, ge=1900, le=datetime.now().year)
    birth_month: Optional[int] = Field(None, ge=1, le=12)
    birth_day: Optional[int] = Field(None, ge=1, le=31)
    current_location_id: Optional[int] = Field(None, ge=1)
    email: Optional[EmailStr] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    hair_color: Optional[str] = Field(None, max_length=50)


# Схемы для связей
class ProfileConnectionSchema(BaseModel):
    profile_id: int
    connected_profile_id: int
    relation_type: str


class ProfileConnectionReadSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    connected_profile: ProfileReadSchema
    relation_type: str
    created_at: datetime
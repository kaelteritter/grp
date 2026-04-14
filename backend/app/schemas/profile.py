# backend/app/schemas/profile.py

from enum import Enum
from pydantic import BaseModel, Field, field_validator, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional, List

from app.schemas.location import LocationReadSchema
from app.schemas.link import LinkReadSchema
from app.schemas.photo import PhotoForProfileReadSchema
from app.schemas.place import PlaceReadSchema
from app.schemas.video import VideoForProfileReadSchema


class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"


class ProfileFieldsValidationMixin:
    """
    Валидаторы для полей профиля
    """
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


class ProfileCreateSchema(BaseModel, ProfileFieldsValidationMixin):
    """
    Схема для создания профиля
    Примечания:
    - employments: создаем через /professions/profile/employment/ через m2m
    - photos и videos: /photos/multiple/ и /videos/multiple/ с указанием profile_id
    - links: /links/ с указанием profile_id, platform_id
    - connections: /connections/ с указанием profile_id, connected_profile_id, relation_type
    """
    first_name: Optional[str] = Field(None, max_length=255)
    middle_name: Optional[str] = Field(None, max_length=255)
    last_name: Optional[str] = Field(None, max_length=255)

    sex: Gender = Field(...)
    hair_color: Optional[str] = Field(None, max_length=50)

    birth_year: Optional[int] = Field(None, ge=1900, le=datetime.now().year)
    birth_month: Optional[int] = Field(None, ge=1, le=12)
    birth_day: Optional[int] = Field(None, ge=1, le=31)

    university_id: Optional[int] = Field(None, ge=1)
    current_location_id: Optional[int] = Field(None, ge=1)

    email: Optional[EmailStr] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)


class ProfileEmploymentReadSchema(BaseModel):
    """
    Схема для чтения информации о трудоустройстве профиля
    """
    model_config = ConfigDict(from_attributes=True)
    
    profession_id: int
    profession_name: str
    company_id: Optional[int] = None
    company_name: Optional[str] = None
    start_year: Optional[int] = None
    end_year: Optional[int] = None


class ProfileReadSchema(BaseModel):
    """
    Схема для чтения профиля с вложенными данными
    """
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None

    birth_year: Optional[int] = None
    birth_month: Optional[int] = None
    birth_day: Optional[int] = None

    sex: Gender = Field(...)
    hair_color: Optional[str] = None

    email: Optional[EmailStr] = None
    phone: Optional[str] = None

    university: Optional[PlaceReadSchema] = None

    current_location: Optional[LocationReadSchema] = None
    employments: Optional[List[ProfileEmploymentReadSchema]] = []

    links: Optional[List[LinkReadSchema]] = []
    photos: Optional[List[PhotoForProfileReadSchema]] = []
    videos: Optional[List[VideoForProfileReadSchema]] = []

    connections: Optional[List["ProfileConnectionReadSchema"]] = []

    created_at: datetime
    updated_at: datetime


class ProfileUpdateSchema(BaseModel, ProfileFieldsValidationMixin):
    """
    Cхема для обновления профиля
    photos, videos, links и connections обновляем через соответствующие эндпоинты
    """
    first_name: Optional[str] = Field(None, max_length=255)
    middle_name: Optional[str] = Field(None, max_length=255)
    last_name: Optional[str] = Field(None, max_length=255)

    sex: Optional[Gender] = None
    hair_color: Optional[str] = Field(None, max_length=50)

    birth_year: Optional[int] = Field(None, ge=1900, le=datetime.now().year)
    birth_month: Optional[int] = Field(None, ge=1, le=12)
    birth_day: Optional[int] = Field(None, ge=1, le=31)

    university_id: Optional[int] = Field(None, ge=1)
    current_location_id: Optional[int] = Field(None, ge=1)

    email: Optional[EmailStr] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)



class ProfileForConnectionReadSchema(BaseModel):
    """Упрощённая схема профиля для отображения в связях (без циклических ссылок)"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    photos: Optional[List[PhotoForProfileReadSchema]] = []


class ProfileConnectionReadSchema(BaseModel):
    """
    Схема для чтения информации о связи между профилями
    """
    connected_profile_id: int
    connected_profile: Optional[ProfileForConnectionReadSchema] = None
    relation_type: str
    created_at: datetime
    


class ProfileConnectionCreateSchema(BaseModel):
    """
    Схема для создания связи между профилями
    """
    profile_id: int
    connected_profile_id: int
    relation_type: str
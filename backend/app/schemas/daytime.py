from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class DayTimeBaseSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    cover_url: Optional[str] = Field(None, max_length=500)


class DayTimeCreateSchema(DayTimeBaseSchema):
    pass


class DayTimeUpdateSchema(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    cover_url: Optional[str] = Field(None, max_length=500)


class DayTimeReadSchema(DayTimeBaseSchema):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
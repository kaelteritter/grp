from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class EventBaseSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    cover_url: Optional[str] = Field(None, max_length=500)


class EventCreateSchema(EventBaseSchema):
    pass


class EventUpdateSchema(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    cover_url: Optional[str] = Field(None, max_length=500)


class EventReadSchema(EventBaseSchema):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
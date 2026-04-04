from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class SeasonBaseSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    cover_url: Optional[str] = Field(None, max_length=500)


class SeasonCreateSchema(SeasonBaseSchema):
    pass


class SeasonUpdateSchema(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    cover_url: Optional[str] = Field(None, max_length=500)


class SeasonReadSchema(SeasonBaseSchema):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
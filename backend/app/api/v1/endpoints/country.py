# backend/app/api/v1/endpoints/country.py 

from fastapi import APIRouter
from starlette import status

from app import services
from app.core.database import SessionDep
from app.schemas.country import CountryCreateSchema, CountryReadSchema, CountryUpdateSchema


router = APIRouter(prefix="/countries", tags=["countries"])





@router.post("/", response_model=CountryReadSchema, status_code=status.HTTP_201_CREATED)
async def create_country(db: SessionDep, country_in: CountryCreateSchema):
    return await services.create_country(db, country_in)


@router.get("/", response_model=list[CountryReadSchema], status_code=status.HTTP_200_OK)
async def read_countries(db: SessionDep):
    return await services.read_countries(db)


@router.get("/{country_id}", response_model=CountryReadSchema, status_code=status.HTTP_200_OK)
async def read_country(db: SessionDep, country_id: int):
    return await services.read_country(db, country_id)


@router.patch("/{country_id}", response_model=CountryReadSchema, status_code=status.HTTP_200_OK)
async def update_country(db: SessionDep, country_id: int, country_in: CountryUpdateSchema):
    return await services.update_country(db, country_id, country_in)


@router.delete("/{country_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_country(db: SessionDep, country_id: int):
    await services.delete_country(db, country_id)
    return {
        "id": country_id,
        "status": "deleted",
    }
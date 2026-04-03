# backend/app/services/country.py

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status

from app.models.country import Country
from app.schemas.country import CountryCreateSchema, CountryReadSchema, CountryUpdateSchema


async def create_country(db: AsyncSession, country_in: CountryCreateSchema):
    try:
        stmt = select(Country).where(Country.name == country_in.name)
        result = await db.execute(stmt)
        existing = result.scalar_one_or_none()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Страна с названием '{country_in.name}' уже существует"
            )
        
        country = Country(**country_in.model_dump())
        db.add(country)
        await db.commit()
        await db.refresh(country)
        return country
    except IntegrityError as e:
        await db.rollback()
        if "UNIQUE constraint failed" in str(e):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Страна с названием \'{country_in.name}\' уже существует"
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ошибка при создании страны"
        )


async def read_country(db: AsyncSession, country_id: int):
    stmt = select(Country).where(Country.id == country_id)
    result = await db.execute(stmt)
    country = result.scalar_one_or_none()

    if not country:
        raise HTTPException(status_code=404, detail="Страна не найдена")
    
    return country


async def read_countries(db: AsyncSession):
    stmt = select(Country)
    result = await db.execute(stmt)
    return result.scalars().all()


async def update_country(db: AsyncSession, country_id: int, country_in: CountryUpdateSchema):
    stmt = select(Country).where(Country.id == country_id)
    result = await db.execute(stmt)
    country = result.scalar_one_or_none()

    if not country:
        raise HTTPException(status_code=404, detail="Страна не найдена")
    
    update_data = country_in.model_dump()

    try:
        for field, value in update_data.items():
            setattr(country, field, value)
        
        await db.commit()
        await db.refresh(country)
        return country
    except IntegrityError as e:
        await db.rollback()
        if "UNIQUE constraint failed" in str(e):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Страна с названием \'{update_data.get('name')}\' уже существует"
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ошибка при обновлении страны"
        )


async def delete_country(db: AsyncSession, country_id: int):
    stmt = select(Country).where(Country.id == country_id)
    result = await db.execute(stmt)
    country = result.scalar_one_or_none()

    if not country:
        raise HTTPException(status_code=404, detail="Страна не найдена")
    
    await db.delete(country)
    await db.commit()

    return {"ok": True}

    

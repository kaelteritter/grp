import logging
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.company import Company
from app.models.address import Address
from app.models.location import Location
from app.models.region import Region
from app.schemas.company import CompanyCreateSchema, CompanyUpdateSchema

logger = logging.getLogger(__name__)


async def create_company(db: AsyncSession, company_in: CompanyCreateSchema):
    """Создание компании"""
    try:
        # Проверяем существование адресов (если указаны)
        addresses = []
        if company_in.address_ids:
            stmt = select(Address).where(Address.id.in_(company_in.address_ids))
            result = await db.execute(stmt)
            addresses = result.scalars().all()
            
            if len(addresses) != len(company_in.address_ids):
                found_ids = [a.id for a in addresses]
                missing_ids = set(company_in.address_ids) - set(found_ids)
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Адреса с ID {list(missing_ids)} не найдены"
                )
        
        company = Company(name=company_in.name)
        if addresses:
            company.addresses = addresses
        
        db.add(company)
        await db.commit()
        await db.refresh(company)
        
        # Подгружаем связанные данные - правильный путь вложенности
        stmt = select(Company).where(Company.id == company.id).options(
            selectinload(Company.addresses).selectinload(Address.location).selectinload(Location.region).selectinload(Region.country)
        )
        result = await db.execute(stmt)
        company = result.scalar_one()
        
        return company
        
    except IntegrityError as e:
        await db.rollback()
        logger.error(f"IntegrityError in create_company: {e}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ошибка целостности данных при создании компании"
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in create_company: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка при создании компании: {str(e)}"
        )


async def read_company(db: AsyncSession, company_id: int):
    """Получение компании по ID"""
    stmt = select(Company).where(Company.id == company_id).options(
        selectinload(Company.addresses).selectinload(Address.location).selectinload(Location.region).selectinload(Region.country)
    )
    result = await db.execute(stmt)
    company = result.scalar_one_or_none()

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Компания не найдена"
        )
    
    return company


async def read_companies(
    db: AsyncSession,
    skip: int = 0,
    search: Optional[str] = None,
    limit: int = 100
):
    """Получение списка компаний"""
    stmt = select(Company).options(
        selectinload(Company.addresses).selectinload(Address.location).selectinload(Location.region).selectinload(Region.country)
    )

    if search:
        stmt = stmt.where(Company.name.ilike(f"%{search}%"))

    stmt = stmt.offset(skip).limit(limit).order_by(Company.name)
    
    result = await db.execute(stmt)
    return result.scalars().all()


async def update_company(
    db: AsyncSession,
    company_id: int,
    company_in: CompanyUpdateSchema
):
    """Обновление компании"""
    try:
        company = await read_company(db, company_id)
        
        update_data = company_in.model_dump(exclude_unset=True)
        
        # Обновляем имя
        if "name" in update_data and update_data["name"] is not None:
            company.name = update_data["name"]
        
        # Обновляем связи с адресами
        if "address_ids" in update_data:
            if update_data["address_ids"] is None:
                company.addresses = []
            else:
                stmt = select(Address).where(Address.id.in_(update_data["address_ids"]))
                result = await db.execute(stmt)
                addresses = result.scalars().all()
                
                if len(addresses) != len(update_data["address_ids"]):
                    found_ids = [a.id for a in addresses]
                    missing_ids = set(update_data["address_ids"]) - set(found_ids)
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Адреса с ID {list(missing_ids)} не найдены"
                    )
                company.addresses = addresses
        
        await db.commit()
        await db.refresh(company)
        
        # Подгружаем связанные данные
        stmt = select(Company).where(Company.id == company_id).options(
            selectinload(Company.addresses).selectinload(Address.location).selectinload(Location.region).selectinload(Region.country)
        )
        result = await db.execute(stmt)
        company = result.scalar_one()
        
        return company
        
    except IntegrityError as e:
        await db.rollback()
        logger.error(f"IntegrityError in update_company: {e}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ошибка целостности данных при обновлении компании"
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in update_company: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка при обновлении компании: {str(e)}"
        )


async def delete_company(db: AsyncSession, company_id: int):
    """Удаление компании"""
    company = await read_company(db, company_id)
    
    await db.delete(company)
    await db.commit()
    
    return {"ok": True}
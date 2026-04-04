from fastapi import APIRouter, Query, status
from typing import List, Optional

from app.core.database import SessionDep
from app.schemas.company import CompanyCreateSchema, CompanyReadSchema, CompanyUpdateSchema
from app import services


router = APIRouter(prefix="/companies", tags=["companies"])


def enrich_company(company):
    """Преобразует модель Company в Pydantic схему"""
    return CompanyReadSchema.model_validate(company, from_attributes=True)


@router.post("/", response_model=CompanyReadSchema, status_code=status.HTTP_201_CREATED)
async def create_company(
    db: SessionDep,
    company_in: CompanyCreateSchema
):
    """
    Создать новую компанию
    """
    company = await services.create_company(db, company_in)
    return enrich_company(company)


@router.get("/", response_model=List[CompanyReadSchema])
async def read_companies(
    db: SessionDep,
    skip: int = Query(0, ge=0, description="Пропустить записей"),
    limit: int = Query(100, ge=1, le=1000, description="Лимит записей")
):
    """
    Получить список компаний
    """
    companies = await services.read_companies(db, skip=skip, limit=limit)
    return [enrich_company(company) for company in companies]


@router.get("/{company_id}", response_model=CompanyReadSchema)
async def read_company(
    db: SessionDep,
    company_id: int
):
    """
    Получить компанию по ID
    """
    company = await services.read_company(db, company_id)
    return enrich_company(company)


@router.patch("/{company_id}", response_model=CompanyReadSchema)
async def update_company(
    db: SessionDep,
    company_id: int,
    company_in: CompanyUpdateSchema
):
    """
    Обновить компанию
    """
    company = await services.update_company(db, company_id, company_in)
    return enrich_company(company)


@router.delete("/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_company(
    db: SessionDep,
    company_id: int
):
    """
    Удалить компанию
    """
    await services.delete_company(db, company_id)
    return None
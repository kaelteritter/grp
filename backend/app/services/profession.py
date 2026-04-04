import logging
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.profession import Profession, employments
from app.models.profile import Profile
from app.models.company import Company
from app.schemas.profession import ProfessionCreateSchema, ProfessionUpdateSchema, EmploymentSchema

logger = logging.getLogger(__name__)


async def create_profession(db: AsyncSession, profession_in: ProfessionCreateSchema):
    """Создание профессии"""
    try:
        profession = Profession(name=profession_in.name)
        db.add(profession)
        await db.commit()
        await db.refresh(profession)
        return profession
        
    except IntegrityError as e:
        await db.rollback()
        if "UNIQUE constraint failed" in str(e):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Профессия с названием '{profession_in.name}' уже существует"
            )
        logger.error(f"IntegrityError in create_profession: {e}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ошибка целостности данных при создании профессии"
        )
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in create_profession: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка при создании профессии: {str(e)}"
        )


async def read_profession(db: AsyncSession, profession_id: int):
    """Получение профессии по ID"""
    stmt = select(Profession).where(Profession.id == profession_id)
    result = await db.execute(stmt)
    profession = result.scalar_one_or_none()

    if not profession:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Профессия не найдена"
        )
    
    return profession


async def read_professions(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None
):
    """Получение списка профессий с поиском"""
    stmt = select(Profession)
    
    if search:
        stmt = stmt.where(Profession.name.ilike(f"%{search}%"))
    
    # Подсчет количества профилей для каждой профессии
    count_stmt = select(employments.c.profession_id, func.count()).group_by(employments.c.profession_id)
    
    stmt = stmt.order_by(Profession.name).offset(skip).limit(limit)
    result = await db.execute(stmt)
    professions = result.scalars().all()
    
    # Получаем количество профилей для каждой профессии
    count_result = await db.execute(count_stmt)
    profile_counts = {row[0]: row[1] for row in count_result}
    
    for profession in professions:
        profession.profile_count = profile_counts.get(profession.id, 0)
    
    return professions


async def update_profession(
    db: AsyncSession,
    profession_id: int,
    profession_in: ProfessionUpdateSchema
):
    """Обновление профессии"""
    try:
        profession = await read_profession(db, profession_id)
        
        update_data = profession_in.model_dump(exclude_unset=True)
        
        if "name" in update_data and update_data["name"] is not None:
            # Проверяем уникальность имени
            stmt = select(Profession).where(
                Profession.name == update_data["name"],
                Profession.id != profession_id
            )
            result = await db.execute(stmt)
            existing = result.scalar_one_or_none()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Профессия с названием '{update_data['name']}' уже существует"
                )
            profession.name = update_data["name"]
        
        await db.commit()
        await db.refresh(profession)
        
        return profession
        
    except IntegrityError as e:
        await db.rollback()
        logger.error(f"IntegrityError in update_profession: {e}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ошибка целостности данных при обновлении профессии"
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in update_profession: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка при обновлении профессии: {str(e)}"
        )


async def delete_profession(db: AsyncSession, profession_id: int):
    """Удаление профессии"""
    profession = await read_profession(db, profession_id)
    
    await db.delete(profession)
    await db.commit()
    
    return {"ok": True}


# Сервисы для работы с employment (связью профиля и профессии)
async def add_profession_to_profile(
    db: AsyncSession,
    employment: EmploymentSchema
):
    """Добавление профессии к профилю"""
    try:
        # Проверяем существование профиля
        stmt = select(Profile).where(Profile.id == employment.profile_id)
        result = await db.execute(stmt)
        profile = result.scalar_one_or_none()
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Профиль с ID {employment.profile_id} не найден"
            )
        
        # Проверяем существование профессии
        stmt = select(Profession).where(Profession.id == employment.profession_id)
        result = await db.execute(stmt)
        profession = result.scalar_one_or_none()
        if not profession:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Профессия с ID {employment.profession_id} не найдена"
            )
        
        # Проверяем существование компании (если указана)
        if employment.company_id:
            stmt = select(Company).where(Company.id == employment.company_id)
            result = await db.execute(stmt)
            company = result.scalar_one_or_none()
            if not company:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Компания с ID {employment.company_id} не найдена"
                )
        
        # Добавляем связь
        stmt = employments.insert().values(
            profile_id=employment.profile_id,
            profession_id=employment.profession_id,
            company_id=employment.company_id,
            start_year=employment.start_year,
            end_year=employment.end_year,
            is_current=employment.is_current
        )
        await db.execute(stmt)
        await db.commit()
        
        return {"ok": True, "message": "Профессия добавлена к профилю"}
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in add_profession_to_profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка при добавлении профессии к профилю: {str(e)}"
        )


async def remove_profession_from_profile(
    db: AsyncSession,
    profile_id: int,
    profession_id: int
):
    """Удаление профессии у профиля"""
    try:
        stmt = employments.delete().where(
            employments.c.profile_id == profile_id,
            employments.c.profession_id == profession_id
        )
        result = await db.execute(stmt)
        await db.commit()
        
        if result.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Связь профиля {profile_id} с профессией {profession_id} не найдена"
            )
        
        return {"ok": True, "message": "Профессия удалена из профиля"}
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in remove_profession_from_profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка при удалении профессии из профиля: {str(e)}"
        )


async def get_profile_professions(
    db: AsyncSession,
    profile_id: int
):
    """Получение всех профессий профиля с деталями"""
    try:
        stmt = select(
            employments.c.profession_id,
            employments.c.company_id,
            employments.c.start_year,
            employments.c.end_year,
            employments.c.is_current,
            Profession.name.label("profession_name")
        ).select_from(
            employments.join(Profession, employments.c.profession_id == Profession.id)
        ).where(employments.c.profile_id == profile_id)
        
        result = await db.execute(stmt)
        rows = result.all()
        
        return [
            {
                "profession_id": row.profession_id,
                "profession_name": row.profession_name,
                "company_id": row.company_id,
                "start_year": row.start_year,
                "end_year": row.end_year,
                "is_current": row.is_current
            }
            for row in rows
        ]
        
    except Exception as e:
        logger.error(f"Unexpected error in get_profile_professions: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка при получении профессий профиля: {str(e)}"
        )
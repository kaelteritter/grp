from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from starlette import status
from sqlalchemy.orm import selectinload

from app.schemas.link import LinkCreateSchema, LinkUpdateSchema
from app.models.link import Link
from app.models.platform import Platform
from app.models.profile import Profile


async def create_link(db: AsyncSession, link_in: LinkCreateSchema):
    # Проверяем существование платформы
    stmt = select(Platform).where(Platform.id == link_in.platform_id)
    result = await db.execute(stmt)
    platform = result.scalar_one_or_none()
    if not platform:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Платформа с ID {link_in.platform_id} не найдена"
        )
    
    # Проверяем существование профиля
    stmt = select(Profile).where(Profile.id == link_in.profile_id)
    result = await db.execute(stmt)
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Профиль с ID {link_in.profile_id} не найден"
        )
    
    link = Link(**link_in.model_dump())
    db.add(link)
    await db.commit()
    await db.refresh(link)
    
    # Подгружаем связанные данные
    stmt = select(Link).where(Link.id == link.id).options(
        selectinload(Link.platform),
        selectinload(Link.profile)
    )
    result = await db.execute(stmt)
    link = result.scalar_one()
    
    return link


async def read_links(db: AsyncSession):
    stmt = select(Link).options(
        selectinload(Link.platform),
        selectinload(Link.profile)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def read_link(db: AsyncSession, link_id: int):
    stmt = select(Link).where(Link.id == link_id).options(
        selectinload(Link.platform),
        selectinload(Link.profile)
    )
    result = await db.execute(stmt)
    link = result.scalar_one_or_none()

    if not link:
        raise HTTPException(status_code=404, detail="Ссылка не найдена")
    
    return link


async def update_link(db: AsyncSession, link_id: int, link_in: LinkUpdateSchema):
    link = await read_link(db, link_id)
    
    update_data = link_in.model_dump(exclude_unset=True)
    
    # Проверяем существование платформы, если она меняется
    if "platform_id" in update_data:
        stmt = select(Platform).where(Platform.id == update_data["platform_id"])
        result = await db.execute(stmt)
        platform = result.scalar_one_or_none()
        if not platform:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Платформа с ID {update_data['platform_id']} не найдена"
            )
    
    # Проверяем существование профиля, если он меняется
    if "profile_id" in update_data:
        stmt = select(Profile).where(Profile.id == update_data["profile_id"])
        result = await db.execute(stmt)
        profile = result.scalar_one_or_none()
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Профиль с ID {update_data['profile_id']} не найден"
            )
    
    for field, value in update_data.items():
        setattr(link, field, value)

    await db.commit()
    await db.refresh(link)
    
    # Подгружаем связанные данные
    stmt = select(Link).where(Link.id == link_id).options(
        selectinload(Link.platform),
        selectinload(Link.profile)
    )
    result = await db.execute(stmt)
    link = result.scalar_one()
    
    return link


async def delete_link(db: AsyncSession, link_id: int):
    link = await read_link(db, link_id)
    
    await db.delete(link)
    await db.commit()
    return {"ok": True}
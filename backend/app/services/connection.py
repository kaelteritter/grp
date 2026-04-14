import logging
from datetime import datetime
from typing import List, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy import delete, insert, select, and_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.profile import Profile, ProfileConnection, RelationType
from app.schemas.profile import ProfileConnectionCreateSchema, ProfileConnectionReadSchema

logger = logging.getLogger(__name__)


# Маппинг для обратных отношений
REVERSE_RELATIONS = {
    RelationType.MOTHER: RelationType.DAUGHTER,
    RelationType.FATHER: RelationType.SON,
    RelationType.DAUGHTER: RelationType.MOTHER,
    RelationType.SON: RelationType.FATHER,
    RelationType.BROTHER: RelationType.SISTER,
    RelationType.SISTER: RelationType.BROTHER,
    RelationType.BOSS: RelationType.SUBORDINATE,
    RelationType.SUBORDINATE: RelationType.BOSS,
    RelationType.FRIEND: RelationType.FRIEND,
    RelationType.BEST_FRIEND: RelationType.BEST_FRIEND,
    RelationType.COLLEAGUE: RelationType.COLLEAGUE,
    RelationType.ACQUAINTANCE: RelationType.ACQUAINTANCE,
    RelationType.PARTNER: RelationType.PARTNER,
}


async def add_connection(db: AsyncSession, connection_in: ProfileConnectionCreateSchema):
    """Добавление связи между профилями"""
    try:
        # Проверяем существование профилей
        stmt = select(Profile).where(Profile.id.in_([connection_in.profile_id, connection_in.connected_profile_id]))
        result = await db.execute(stmt)
        profiles = result.scalars().all()
        
        if len(profiles) != 2:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Один или оба профиля не найдены"
            )
        
        # Проверяем, не существует ли уже связь
        stmt = select(ProfileConnection).where(
            and_(
                ProfileConnection.profile_id == connection_in.profile_id,
                ProfileConnection.connected_profile_id == connection_in.connected_profile_id
            )
        )
        result = await db.execute(stmt)
        existing = result.first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Связь между этими профилями уже существует"
            )
        
        # Получаем тип отношения как строку
        relation_type_str = connection_in.relation_type
        if hasattr(relation_type_str, 'value'):
            relation_type_str = relation_type_str.value
        
        # Определяем обратный тип отношения
        reverse_relation = REVERSE_RELATIONS.get(connection_in.relation_type, connection_in.relation_type)
        reverse_relation_str = reverse_relation.value if hasattr(reverse_relation, 'value') else str(reverse_relation)
        
        now = datetime.now()
        
        # Добавляем прямую связь
        stmt = insert(ProfileConnection).values(
            profile_id=connection_in.profile_id,
            connected_profile_id=connection_in.connected_profile_id,
            relation_type=relation_type_str,
            created_at=now
        )
        await db.execute(stmt)
        
        # Добавляем обратную связь
        stmt = insert(ProfileConnection).values(
            profile_id=connection_in.connected_profile_id,
            connected_profile_id=connection_in.profile_id,
            relation_type=reverse_relation_str,
            created_at=now
        )
        await db.execute(stmt)
        
        await db.commit()
        
        return {"ok": True, "message": "Связь успешно добавлена"}
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in add_connection: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка при добавлении связи: {str(e)}"
        )


async def remove_connection(db: AsyncSession, profile_id: int, connected_profile_id: int):
    """Удаление связи между профилями"""
    try:
        # Удаляем прямую связь
        stmt = delete(ProfileConnection).where(
            and_(
                ProfileConnection.profile_id == profile_id,
                ProfileConnection.connected_profile_id == connected_profile_id
            )
        )
        result = await db.execute(stmt)
        
        # Удаляем обратную связь
        stmt = delete(ProfileConnection).where(
            and_(
                ProfileConnection.profile_id == connected_profile_id,
                ProfileConnection.connected_profile_id == profile_id
            )
        )
        await db.execute(stmt)
        
        await db.commit()
        
        if result.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Связь не найдена"
            )
        
        return {"ok": True, "message": "Связь успешно удалена"}
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in remove_connection: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка при удалении связи: {str(e)}"
        )


async def get_profile_connections(db: AsyncSession, profile_id: int):
    """Получение всех связей профиля"""
    try:
        # Проверяем существование профиля
        stmt = select(Profile).where(Profile.id == profile_id)
        result = await db.execute(stmt)
        profile = result.scalar_one_or_none()
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Профиль не найден"
            )
        
        # Получаем связи
        stmt = select(ProfileConnection).where(
            ProfileConnection.profile_id == profile_id
        ).options(
            selectinload(ProfileConnection.connected_profile)
            .selectinload(Profile.photos)
        )
        result = await db.execute(stmt)
        connections = result.scalars().all()

        return connections
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in get_ProfileConnection: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка при получении связей: {str(e)}"
        )
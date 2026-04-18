import logging
from datetime import datetime
from operator import or_
from typing import List, Dict, Any, Optional
from fastapi import HTTPException, status
from sqlalchemy import delete, insert, select, and_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.profile import Gender, Profile, ProfileConnection, RelationType
from app.schemas.profile import ProfileConnectionCreateSchema, ProfileConnectionReadSchema
from app.services.profile import read_profile

logger = logging.getLogger(__name__)


# Маппинг для обратных отношений
REVERSE_RELATIONS = {
    RelationType.MOTHER: {
        Gender.MALE: RelationType.SON,
        Gender.FEMALE: RelationType.DAUGHTER
    },
    RelationType.FATHER: {
        Gender.MALE: RelationType.SON,
        Gender.FEMALE: RelationType.DAUGHTER  
    },
    RelationType.DAUGHTER: {
        Gender.MALE: RelationType.FATHER,
        Gender.FEMALE: RelationType.MOTHER        
    },
    RelationType.SON:  {
        Gender.MALE: RelationType.FATHER,
        Gender.FEMALE: RelationType.MOTHER        
    },
    RelationType.BROTHER: {
        Gender.MALE: RelationType.BROTHER,
        Gender.FEMALE: RelationType.SISTER        
    },
    RelationType.SISTER: {
        Gender.MALE: RelationType.BROTHER,
        Gender.FEMALE: RelationType.SISTER        
    },
    RelationType.BOSS: {
        Gender.MALE: RelationType.SUBORDINATE,
        Gender.FEMALE: RelationType.SUBORDINATE   
    },
    RelationType.SUBORDINATE: {
        Gender.MALE: RelationType.BOSS,
        Gender.FEMALE: RelationType.BOSS   
    },
    RelationType.FRIEND: {
        Gender.MALE: RelationType.FRIEND,
        Gender.FEMALE: RelationType.FRIEND        
    },
    RelationType.COLLEAGUE: {
        Gender.MALE: RelationType.COLLEAGUE,
        Gender.FEMALE: RelationType.COLLEAGUE                
    },
    RelationType.ACQUAINTANCE: {
        Gender.MALE: RelationType.ACQUAINTANCE,
        Gender.FEMALE: RelationType.ACQUAINTANCE         
    },    
}

def validate_relation_by_gender(relation_type: str, profile_sex: str):
    """Проверяет, допустим ли тип связи для данного пола"""
    if relation_type in [RelationType.MOTHER, RelationType.DAUGHTER, RelationType.SISTER]:
        if profile_sex != Gender.FEMALE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Тип связи '{relation_type}' допустим только для женского пола"
            )
    elif relation_type in [RelationType.FATHER, RelationType.SON, RelationType.BROTHER]:
        if profile_sex != Gender.MALE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Тип связи '{relation_type}' допустим только для мужского пола"
            )
    # Для friend, colleague, acquaintance, boss, subordinate — любые
    return True


def get_reverse_relation(forward_type: str, reverse_sex: str):
    try:
        return REVERSE_RELATIONS[forward_type][reverse_sex] # type: ignore
    except Exception:
        raise



async def read_connection_by_profiles_ids(db: AsyncSession, id1: int, id2: int):
    stmt = (
        select(ProfileConnection)
        .where(
            ProfileConnection.profile_id == id1,
            ProfileConnection.connected_profile_id == id2
        )
    )
    result = await db.execute(stmt)
    connection = result.scalar_one_or_none()

    return connection


async def create_connection(db: AsyncSession, connection_in: ProfileConnectionCreateSchema):
    """Добавление связи между профилями"""
    try:
        # Обработка 404 уже внутри read_profile
        profile1 = await read_profile(db, connection_in.profile_id)
        profile2 = await read_profile(db, connection_in.connected_profile_id)

        
        # Проверка существования связи
        connection1 = await read_connection_by_profiles_ids(db, profile1.id, profile2.id)
        connection2 = await read_connection_by_profiles_ids(db, profile2.id, profile1.id)
        if connection1 or connection2:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Связь между профилями c id{profile1.id} и id{profile2.id} уже существует"
            )
        
        if profile1.id == profile2.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Нельзя создать связь самим с собой"
            )            
        
        forward_relation_type = connection_in.relation_type
        reverse_relation_type = get_reverse_relation(forward_relation_type, profile2.sex)

        validate_relation_by_gender(forward_relation_type, profile1.sex)
        
        forward_connection = ProfileConnection(
            profile_id=profile1.id,
            connected_profile_id=profile2.id,
            relation_type=forward_relation_type,
        )
        
        reverse_connection = ProfileConnection(
            profile_id=profile2.id,
            connected_profile_id=profile1.id,
            relation_type=reverse_relation_type,
        )

        db.add(forward_connection)
        db.add(reverse_connection)
        
        await db.commit()
        await db.refresh(forward_connection)
        await db.refresh(reverse_connection)

        return {"ok": True, "message": "Связь успешно создана"}
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in add_connection: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка при добавлении связи: {str(e)}"
        )


async def delete_connection_by_profiles_ids(db: AsyncSession, profile_id: int, connected_profile_id: int):
    """Удаление связи между профилями"""
    try:
        connection = await read_connection_by_profiles_ids(db, profile_id, connected_profile_id)
        if not connection:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Связь id{profile_id}:id{connected_profile_id} не найдена"
            )

        stmt = delete(ProfileConnection).where(
            and_(
                ProfileConnection.profile_id == profile_id,
                ProfileConnection.connected_profile_id == connected_profile_id
            )
        )
        await db.execute(stmt)

        stmt = delete(ProfileConnection).where(
            and_(
                ProfileConnection.profile_id == connected_profile_id,
                ProfileConnection.connected_profile_id == profile_id
            )
        )
        await db.execute(stmt)
        await db.commit()
        return {"ok": True, "message": "Связь успешно удалена"}
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in delete_connection: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка при удалении связи: {str(e)}"
        )


async def read_connections_by_profile_id(db: AsyncSession, profile_id: Optional[int]):
    """Получение всех связей профиля"""
    stmt = select(ProfileConnection)

    if profile_id:
        profile = await read_profile(db, profile_id)
        stmt = stmt.where(
            ProfileConnection.profile_id == profile_id
        )
    
    result = await db.execute(stmt)
    connections = result.scalars().all()

    return connections
    
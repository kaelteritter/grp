import logging
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy import distinct, func, or_, select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, contains_eager
from sqlalchemy.exc import IntegrityError

from app.models.address import Address
from app.models.place import Place
from app.models.platform import Platform
from app.models.profile import Profile, profile_connections
from app.models.location import Location
from app.models.region import Region
from app.models.country import Country
from app.models.link import Link
from app.models.photo import Photo
from app.models.video import Video
from app.models.profession import Profession, employments
from app.models.company import Company
from app.models.cloth import photo_clothes
from app.schemas.profile import ProfileCreateSchema, ProfileUpdateSchema, ProfileReadSchema, ProfileEmploymentReadSchema, ProfileConnectionReadSchema
from app.schemas.link import LinkReadSchema
from app.schemas.photo import PhotoForProfileReadSchema
from app.schemas.video import VideoForProfileReadSchema

logger = logging.getLogger(__name__)


# ========== Функции конвертации для Pydantic ==========

def _convert_country_to_schema(country) -> Optional[dict]:
    """Преобразует объект Country в словарь"""
    if not country:
        return None
    return {
        "id": country.id,
        "name": country.name
    }


def _convert_region_to_schema(region) -> Optional[dict]:
    """Преобразует объект Region в словарь"""
    if not region:
        return None
    return {
        "id": region.id,
        "name": region.name,
        "country": _convert_country_to_schema(region.country) if hasattr(region, 'country') else None
    }


def _convert_location_to_schema(location) -> Optional[dict]:
    """Преобразует объект Location в словарь"""
    if not location:
        return None
    return {
        "id": location.id,
        "name": location.name,
        "region": _convert_region_to_schema(location.region) if hasattr(location, 'region') else None,
        "latitude": location.latitude,
        "longitude": location.longitude
    }


def _convert_links_to_schema(links: List[Link]) -> List[dict]:
    """Преобразует список объектов Link в список словарей"""
    result = []
    for link in links:
        platform_dict = None
        if link.platform:
            platform_dict = {
                "id": link.platform.id,
                "name": link.platform.name,
                "base_url": link.platform.base_url,
                "icon_url": link.platform.icon_url,
            }
        result.append({
            "id": link.id,
            "url": link.url,
            "platform_id": link.platform_id,
            "profile_id": link.profile_id,
            "platform": platform_dict
        })
    return result


def _convert_photos_to_schema(photos: List[Photo]) -> List[dict]:
    """Преобразует список объектов Photo в список словарей"""
    result = []
    for photo in photos:
        result.append({
            "id": photo.id,
            "url": photo.url,
            "title": photo.title,
            "is_avatar": photo.is_avatar,
            "sort_order": photo.sort_order,
            "created_at": photo.created_at
        })
    return result


def _convert_videos_to_schema(videos: List[Video]) -> List[dict]:
    """Преобразует список объектов Video в список словарей"""
    result = []
    for video in videos:
        result.append({
            "id": video.id,
            "url": video.url,
            "title": video.title,
            "duration": video.duration,
            "is_cover": getattr(video, 'is_cover', False),
            "sort_order": getattr(video, 'sort_order', 0),
            "created_at": video.created_at
        })
    return result


async def _get_profile_with_employments(db: AsyncSession, profile_id: int) -> Optional[Profile]:
    """Вспомогательная функция для получения профиля со всеми связями"""
    stmt = select(Profile).where(Profile.id == profile_id).options(
        selectinload(Profile.current_location).selectinload(Location.region).selectinload(Region.country),
        selectinload(Profile.links).selectinload(Link.platform),
        selectinload(Profile.photos),
        selectinload(Profile.videos),
        selectinload(Profile.university).selectinload(Place.address).selectinload(Address.location).selectinload(Location.region).selectinload(Region.country)
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def _get_profile_employments(db: AsyncSession, profile_id: int) -> List[ProfileEmploymentReadSchema]:
    """Вспомогательная функция для получения трудоустройств профиля"""
    try:
        stmt = select(
            employments.c.profession_id,
            Profession.name.label("profession_name"),
            employments.c.company_id,
            Company.name.label("company_name"),
            employments.c.start_year,
            employments.c.end_year,
            employments.c.is_current
        ).select_from(
            employments
            .join(Profession, employments.c.profession_id == Profession.id)
            .outerjoin(Company, employments.c.company_id == Company.id)
        ).where(employments.c.profile_id == profile_id)
        
        result = await db.execute(stmt)
        rows = result.all()
        
        return [
            ProfileEmploymentReadSchema(
                profession_id=row.profession_id,
                profession_name=row.profession_name,
                company_id=row.company_id,
                company_name=row.company_name,
                start_year=row.start_year,
                end_year=row.end_year,
                is_current=row.is_current
            )
            for row in rows
        ]
    except Exception as e:
        logger.error(f"Error getting profile employments: {e}")
        return []


async def _get_profile_connections(db: AsyncSession, profile_id: int) -> List[ProfileConnectionReadSchema]:
    """Вспомогательная функция для получения связей профиля"""
    try:
        stmt = select(profile_connections).where(
            profile_connections.c.profile_id == profile_id
        )
        result = await db.execute(stmt)
        connections = result.all()
        
        return [
            ProfileConnectionReadSchema(
                connected_profile_id=conn.connected_profile_id,
                relation_type=conn.relation_type,
                created_at=conn.created_at
            )
            for conn in connections
        ]
    except Exception as e:
        logger.error(f"Error getting profile connections: {e}")
        return []


async def create_profile(db: AsyncSession, profile_in: ProfileCreateSchema):
    """Создание профиля"""
    try:
        if profile_in.current_location_id:
            stmt = select(Location).where(Location.id == profile_in.current_location_id)
            result = await db.execute(stmt)
            location = result.scalar_one_or_none()
            if not location:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Локация с ID {profile_in.current_location_id} не найдена"
                )
            
        if profile_in.university_id:
            stmt = select(Place).where(Place.id == profile_in.university_id)
            result = await db.execute(stmt)
            if not result.scalar_one_or_none():
                raise HTTPException(404, detail=f"Университет с ID {profile_in.university_id} не найден")
        
        profile = Profile(**profile_in.model_dump())
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
        
        return profile
        
    except IntegrityError as e:
        await db.rollback()
        if "UNIQUE constraint failed: profiles.email" in str(e):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Профиль с таким email уже существует"
            )
        logger.error(f"IntegrityError in create_profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ошибка целостности данных при создании профиля"
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in create_profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка при создании профиля: {str(e)}"
        )


async def read_profile(db: AsyncSession, profile_id: int) -> ProfileReadSchema:
    """Получение профиля по ID с подгрузкой всех связей"""
    profile = await _get_profile_with_employments(db, profile_id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Профиль не найден"
        )
    
    # Получаем трудоустройства и связи
    employments_data = await _get_profile_employments(db, profile_id)
    connections_data = await _get_profile_connections(db, profile_id)
    
    # Преобразуем связи в словари
    links_data = _convert_links_to_schema(profile.links) if profile.links else []
    photos_data = _convert_photos_to_schema(profile.photos) if profile.photos else []
    videos_data = _convert_videos_to_schema(profile.videos) if profile.videos else []
    location_data = _convert_location_to_schema(profile.current_location)
    
    # Формируем ответ
    return ProfileReadSchema(
        id=profile.id,
        first_name=profile.first_name,
        middle_name=profile.middle_name,
        last_name=profile.last_name,
        birth_year=profile.birth_year,
        birth_month=profile.birth_month,
        birth_day=profile.birth_day,
        sex=profile.sex,
        hair_color=profile.hair_color,
        email=profile.email,
        phone=profile.phone,
        current_location=location_data,
        employments=employments_data,
        links=links_data,
        photos=photos_data,
        videos=videos_data,
        connections=connections_data,
        created_at=profile.created_at,
        updated_at=profile.updated_at
    )


async def read_profiles(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
    cloth_ids: Optional[List[int]] = None,
    search: Optional[str] = None
) -> List[ProfileReadSchema]:
    try:
        stmt = select(Profile).options(
            selectinload(Profile.current_location).selectinload(Location.region).selectinload(Region.country),
            selectinload(Profile.links).selectinload(Link.platform),
            selectinload(Profile.photos),
            selectinload(Profile.videos),
            selectinload(Profile.professions)  # загружаем профессии
        )

        if cloth_ids:
            # ... фильтр по одежде (без изменений)
            pass

        if search:
            search_term = f"%{search}%"
            conditions = [
                Profile.first_name.ilike(search_term),
                Profile.middle_name.ilike(search_term),
                Profile.last_name.ilike(search_term),
                Profile.email.ilike(search_term),
                Profile.phone.ilike(search_term),
                Profile.current_location.has(Location.name.ilike(search_term)),  # поиск по локации
                Profile.professions.any(Profession.name.ilike(search_term)),   # поиск по профессии
                Profile.links.any(Link.platform.has(Platform.name.ilike(search_term))),  # поиск по платформе
                Profile.links.any(Link.url.ilike(search_term)),  # поиск по URL ссылки
            ]
            stmt = stmt.where(or_(*conditions))

        stmt = stmt.offset(skip).limit(limit).order_by(Profile.created_at.desc())
        result = await db.execute(stmt)
        profiles = result.scalars().all()
        
        # Для каждого профиля получаем трудоустройства и связи
        result_profiles = []
        for profile in profiles:
            employments_data = await _get_profile_employments(db, profile.id)
            connections_data = await _get_profile_connections(db, profile.id)
            
            links_data = _convert_links_to_schema(profile.links) if profile.links else []
            photos_data = _convert_photos_to_schema(profile.photos) if profile.photos else []
            videos_data = _convert_videos_to_schema(profile.videos) if profile.videos else []
            location_data = _convert_location_to_schema(profile.current_location)
            
            result_profiles.append(
                ProfileReadSchema(
                    id=profile.id,
                    first_name=profile.first_name,
                    middle_name=profile.middle_name,
                    last_name=profile.last_name,
                    birth_year=profile.birth_year,
                    birth_month=profile.birth_month,
                    birth_day=profile.birth_day,
                    sex=profile.sex,
                    hair_color=profile.hair_color,
                    email=profile.email,
                    phone=profile.phone,
                    current_location=location_data,
                    employments=employments_data,
                    links=links_data,
                    photos=photos_data,
                    videos=videos_data,
                    connections=connections_data,
                    created_at=profile.created_at,
                    updated_at=profile.updated_at
                )
            )
        
        return result_profiles
        
    except Exception as e:
        logger.error(f"Error reading profiles: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка чтения профилей: {str(e)}"
        )


async def update_profile(db: AsyncSession, profile_id: int, profile_in: ProfileUpdateSchema) -> ProfileReadSchema:
    """Обновление профиля"""
    try:
        # Получаем профиль с подгрузкой current_location
        stmt = select(Profile).where(Profile.id == profile_id).options(
            selectinload(Profile.current_location).selectinload(Location.region).selectinload(Region.country)
        )
        result = await db.execute(stmt)
        profile = result.scalar_one_or_none()

        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Профиль не найден"
            )
        
        update_data = profile_in.model_dump(exclude_unset=True)
        
        # Проверяем существование локации (если меняется)
        if "current_location_id" in update_data:
            if update_data["current_location_id"] is not None:
                stmt = select(Location).where(Location.id == update_data["current_location_id"])
                result = await db.execute(stmt)
                location = result.scalar_one_or_none()
                if not location:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Локация с ID {update_data['current_location_id']} не найдена"
                    )
                
        if profile_in.university_id:
            stmt = select(Place).where(Place.id == profile_in.university_id)
            result = await db.execute(stmt)
            if not result.scalar_one_or_none():
                raise HTTPException(404, detail=f"Университет с ID {profile_in.university_id} не найден")
        
        # Обновляем поля
        for field, value in update_data.items():
            setattr(profile, field, value)

        await db.commit()
        await db.refresh(profile)
        
        # Получаем трудоустройства и связи
        employments_data = await _get_profile_employments(db, profile_id)
        connections_data = await _get_profile_connections(db, profile_id)
        
        # Подгружаем обновленные связанные данные
        stmt = select(Profile).where(Profile.id == profile_id).options(
            selectinload(Profile.current_location).selectinload(Location.region).selectinload(Region.country),
            selectinload(Profile.links).selectinload(Link.platform),
            selectinload(Profile.photos),
            selectinload(Profile.videos).selectinload(Profile.university)
        )
        result = await db.execute(stmt)
        profile = result.scalar_one()
        
        links_data = _convert_links_to_schema(profile.links) if profile.links else []
        photos_data = _convert_photos_to_schema(profile.photos) if profile.photos else []
        videos_data = _convert_videos_to_schema(profile.videos) if profile.videos else []
        location_data = _convert_location_to_schema(profile.current_location)
        
        return ProfileReadSchema(
            id=profile.id,
            first_name=profile.first_name,
            middle_name=profile.middle_name,
            last_name=profile.last_name,
            birth_year=profile.birth_year,
            birth_month=profile.birth_month,
            birth_day=profile.birth_day,
            sex=profile.sex,
            hair_color=profile.hair_color,
            email=profile.email,
            phone=profile.phone,
            current_location=location_data,
            employments=employments_data,
            links=links_data,
            photos=photos_data,
            videos=videos_data,
            connections=connections_data,
            created_at=profile.created_at,
            updated_at=profile.updated_at
        )
        
    except IntegrityError as e:
        await db.rollback()
        if "UNIQUE constraint failed: profiles.email" in str(e):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Профиль с таким email уже существует"
            )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ошибка целостности данных при обновлении профиля"
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error in update_profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка при обновлении профиля: {str(e)}"
        )


async def delete_profile(db: AsyncSession, profile_id: int):
    """Удаление профиля"""
    stmt = select(Profile).where(Profile.id == profile_id)
    result = await db.execute(stmt)
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Профиль не найден"
        )

    await db.delete(profile)
    await db.commit()
    
    return {"ok": True}
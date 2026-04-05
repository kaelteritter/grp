from datetime import datetime
import enum

from sqlalchemy import CheckConstraint, DateTime, Enum, ForeignKey, Integer, String, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


# Таблица связей между профилями
profile_connections = Table(
    "profile_connections",
    Base.metadata,
    Column("profile_id", Integer, ForeignKey("profiles.id", ondelete="CASCADE"), primary_key=True),
    Column("connected_profile_id", Integer, ForeignKey("profiles.id", ondelete="CASCADE"), primary_key=True),
    Column("relation_type", String(50), nullable=False),
    Column("created_at", DateTime, default=datetime.now)
)


class Gender(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"


class RelationType(str, enum.Enum):
    # Родительские отношения
    MOTHER = "mother"
    FATHER = "father"
    DAUGHTER = "daughter"
    SON = "son"
    # Сиблинги
    BROTHER = "brother"
    SISTER = "sister"
    # Дружеские
    FRIEND = "friend"
    BEST_FRIEND = "best_friend"
    # Рабочие
    COLLEAGUE = "colleague"
    BOSS = "boss"
    SUBORDINATE = "subordinate"
    # Другие
    ACQUAINTANCE = "acquaintance"
    PARTNER = "partner"


class Profile(Base):
    """
    Таблица профилей.
    """
    __tablename__ = "profiles"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    # ФИО
    first_name: Mapped[str] = mapped_column(
        String(255),
        nullable=True,
    )
    middle_name: Mapped[str] = mapped_column(
        String(255),
        nullable=True,
    )
    last_name: Mapped[str] = mapped_column(
        String(255),
        nullable=True,
    )

    # Физические характеристики
    sex: Mapped[Gender] = mapped_column(Enum(Gender), nullable=False)
    hair_color: Mapped[str] = mapped_column(
        String(50),
        nullable=True
    )

    # Дата рождения
    birth_year: Mapped[int] = mapped_column(Integer, nullable=True)
    birth_month: Mapped[int] = mapped_column(Integer, nullable=True)
    birth_day: Mapped[int] = mapped_column(Integer, nullable=True)

    # Контактные данные
    email: Mapped[str] = mapped_column(
        String(255),
        nullable=True,
        unique=True
    )
    phone: Mapped[str] = mapped_column(
        String(20),
        nullable=True
    )


    # Локации
    current_location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"), nullable=True)
    current_location = relationship(
        "Location",
        back_populates="profiles",
        lazy="selectin"
    )

    # Метаданные
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now,
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now,
        onupdate=datetime.now,
        nullable=False
    )

    # Связи
    links = relationship(
        "Link",
        back_populates="profile",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    photos = relationship(
        "Photo",
        back_populates="profile",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    
    videos = relationship(
        "Video",
        back_populates="profile",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    
    professions = relationship(
        "Profession",
        secondary="employments",
        back_populates="profiles",
        lazy="selectin"
    )
    
    # Связи с другими профилями
    connections = relationship(
        "Profile",
        secondary=profile_connections,
        primaryjoin=id == profile_connections.c.profile_id,
        secondaryjoin=id == profile_connections.c.connected_profile_id,
        viewonly=True,
        lazy="selectin"
    )

    # Отметки на фотографиях
    photo_tags = relationship(
        "PhotoTag",
        back_populates="profile",
        cascade="all, delete-orphan",
        lazy="selectin"
    )


    __table_args__ = (
        CheckConstraint(
            "birth_month IS NULL OR (birth_month BETWEEN 1 AND 12)",
            name="check_birth_month_range"
        ),
        CheckConstraint(
            "birth_day IS NULL OR (birth_day BETWEEN 1 AND 31)",
            name="check_birth_day_range"
        ),
        CheckConstraint(
            """
            (
                birth_year IS NULL OR 
                birth_month IS NULL OR 
                birth_day IS NULL OR
                (
                    birth_day <= CASE birth_month
                        WHEN 1 THEN 31
                        WHEN 2 THEN (
                            CASE 
                                WHEN (birth_year % 4 = 0 AND birth_year % 100 != 0) 
                                     OR (birth_year % 400 = 0) 
                                THEN 29 
                                ELSE 28 
                            END
                        )
                        WHEN 3 THEN 31
                        WHEN 4 THEN 30
                        WHEN 5 THEN 31
                        WHEN 6 THEN 30
                        WHEN 7 THEN 31
                        WHEN 8 THEN 31
                        WHEN 9 THEN 30
                        WHEN 10 THEN 31
                        WHEN 11 THEN 30
                        WHEN 12 THEN 31
                    END
                )
            )
            """,
            name="check_valid_date"
        ),
    )
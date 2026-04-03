# backend/app/models/profile.py

from datetime import datetime
import enum

from sqlalchemy import CheckConstraint, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Gender(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"


class Profile(Base):
    """
    Таблица профилей.
    Обязательно только ID
    Дату рождения необходимо разделить на части, потому что может быть известно
    только два или один из трех параметров
    """
    __tablename__ = "profiles"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )
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
    sex: Mapped[Gender] = mapped_column(Enum(Gender), default=Gender.MALE)
    birth_year: Mapped[int] = mapped_column(Integer, nullable=True)
    birth_month: Mapped[int] = mapped_column(Integer, nullable=True)
    birth_day: Mapped[int] = mapped_column(Integer, nullable=True)

    current_location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"), nullable=True)
    current_location = relationship(
        "Location",
        back_populates="profiles",
    )

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
        lazy="selectin",
        order_by="Photo.sort_order"
    )

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
        {"extend_existing": True},
    )
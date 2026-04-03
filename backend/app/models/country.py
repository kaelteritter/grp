# backend/app/models/country.py

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Country(Base):
    """
    Справочник стран
    """
    __tablename__ = "countries"
    __table_args__ = {"extend_existing": True}

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )
    name: Mapped[str] = mapped_column(
        String(255), 
        unique=True, 
        nullable=False
    )
    
    # Связь с регионами
    regions = relationship(
        "Region", 
        back_populates="country",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
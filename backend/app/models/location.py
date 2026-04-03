# backend/app/models/location.py

from sqlalchemy import ForeignKey, Integer, String, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Location(Base):
    """
    Справочник локаций (населённых пунктов)
    """
    __tablename__ = "locations"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )
    name: Mapped[str] = mapped_column(
        String(255), 
        nullable=False
    )
    region_id: Mapped[int] = mapped_column(
        ForeignKey("regions.id", ondelete="SET NULL"), 
        nullable=True
    )
    latitude: Mapped[float] = mapped_column(
        Float, 
        nullable=True
    )
    longitude: Mapped[float] = mapped_column(
        Float, 
        nullable=True
    )
    
    region = relationship(
        "Region", 
        back_populates="locations",
        lazy="selectin"
    )

    profiles = relationship(
        "Profile", 
        back_populates="current_location",
        lazy="selectin"
    )
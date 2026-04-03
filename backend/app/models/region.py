# backend/app/models/region.py


from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Region(Base):
    """
    Справочник регионов
    """
    __tablename__ = "regions"
    __table_args__ = {"extend_existing": True}

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    country_id: Mapped[int] = mapped_column(
        ForeignKey("countries.id", ondelete="SET NULL"), 
        nullable=True
    )
    
    # Связь со страной
    country = relationship(
        "Country", 
        back_populates="regions",
        lazy="selectin"
    )

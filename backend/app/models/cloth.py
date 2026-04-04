from sqlalchemy import Column, ForeignKey, Integer, String, Table
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


# Таблица связи многие-ко-многим для Photo и Cloth
photo_clothes = Table(
    "photo_clothes",
    Base.metadata,
    Column("photo_id", Integer, ForeignKey("photos.id", ondelete="CASCADE"), primary_key=True),
    Column("clothes_id", Integer, ForeignKey("clothes.id", ondelete="CASCADE"), primary_key=True)
)


class Cloth(Base):
    """
    Справочник одежды
    """
    __tablename__ = "clothes"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )
    name: Mapped[str] = mapped_column(
        String(255), 
        nullable=False
    )
    color: Mapped[str] = mapped_column(
        String(255), 
        nullable=False
    )
    material: Mapped[str] = mapped_column(
        String(255), 
        nullable=False
    )
    cover_url: Mapped[str] = mapped_column(
        String(500),
        nullable=True
    )
    
    # Связь многие-ко-многим с фото
    photos = relationship(
        "Photo",
        secondary=photo_clothes,
        back_populates="clothes",
        lazy="selectin"
    )
from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class DayTime(Base):
    """
    Справочник времени суток
    """
    __tablename__ = "daytimes"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )
    name: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True
    )
    cover_url: Mapped[str] = mapped_column(
        String(500),
        nullable=True
    )
    
    # Связь с фото
    photos = relationship("Photo", back_populates="daytime", lazy="selectin")
# backend/app/models/link.py

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Link(Base):
    """
    Ссылка на профиль в социальной сети или маркетплейсе
    """
    __tablename__ = "links"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )
    url: Mapped[str] = mapped_column(String(255), nullable=False)
    platform_id: Mapped[int] = mapped_column(
        ForeignKey("platforms.id", ondelete="CASCADE"), 
        nullable=False
    )
    profile_id: Mapped[int] = mapped_column(
        ForeignKey("profiles.id", ondelete="CASCADE"), 
        nullable=False
    )

    # Связь с платформой
    platform = relationship(
        "Platform", 
        back_populates="links",
        lazy="selectin"
    )
    # Связь с профилем
    profile = relationship(
        "Profile", 
        back_populates="links",
        lazy="selectin"
    )
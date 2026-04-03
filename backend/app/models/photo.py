from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates

from app.db.base import Base


class Photo(Base):
    """
    Фотографии профиля
    """
    __tablename__ = "photos"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )
    profile_id: Mapped[int] = mapped_column(
        ForeignKey("profiles.id", ondelete="CASCADE"),
        nullable=False
    )
    url: Mapped[str] = mapped_column(
        String(500),
        nullable=False
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=True
    )
    is_avatar: Mapped[bool] = mapped_column(
        default=False,
        nullable=False
    )
    sort_order: Mapped[int] = mapped_column(
        default=0,
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now,
        nullable=False
    )

    # Связь с профилем
    profile = relationship("Profile", back_populates="photos")

    @validates('url')
    def validate_url(self, key, url):
        if not url or not url.strip():
            raise ValueError("URL фото не может быть пустым")
        if len(url) > 500:
            raise ValueError("URL не может быть длиннее 500 символов")
        return url.strip()
    
    
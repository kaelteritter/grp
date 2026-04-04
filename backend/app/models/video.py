from datetime import datetime
from sqlalchemy import ForeignKey, Integer, String, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates

from app.db.base import Base


class Video(Base):
    """
    Видео профиля
    """
    __tablename__ = "videos"

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
    thumbnail_url: Mapped[str] = mapped_column(
        String(500),
        nullable=True
    )
    duration: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False
    )
    is_cover: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )
    sort_order: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now,
        nullable=False
    )

    # Связь с профилем
    profile = relationship("Profile", back_populates="videos", lazy="selectin")

    @validates('url')
    def validate_url(self, key, url):
        if not url or not url.strip():
            raise ValueError("URL видео не может быть пустым")
        if len(url) > 500:
            raise ValueError("URL не может быть длиннее 500 символов")
        return url.strip()

    @validates('thumbnail_url')
    def validate_thumbnail_url(self, key, url):
        if url is not None and not url.strip():
            raise ValueError("URL превью не может быть пустым")
        if url and len(url) > 500:
            raise ValueError("URL превью не может быть длиннее 500 символов")
        return url.strip() if url else None

    @validates('duration')
    def validate_duration(self, key, duration):
        if duration < 0:
            raise ValueError("Длительность не может быть отрицательной")
        return duration
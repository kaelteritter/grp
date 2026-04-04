from sqlalchemy import ForeignKey, Integer, Float, DateTime, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime

from app.db.base import Base


class PhotoTag(Base):
    """
    Отметка человека на фотографии
    """
    __tablename__ = "photo_tags"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )
    photo_id: Mapped[int] = mapped_column(
        ForeignKey("photos.id", ondelete="CASCADE"),
        nullable=False
    )
    profile_id: Mapped[int] = mapped_column(
        ForeignKey("profiles.id", ondelete="CASCADE"),
        nullable=False
    )
    x: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )
    y: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now,
        nullable=False
    )

    # Связи
    photo = relationship("Photo", back_populates="tags", lazy="selectin")
    profile = relationship("Profile", back_populates="photo_tags", lazy="selectin")

    __table_args__ = (
        UniqueConstraint('photo_id', 'profile_id', name='uq_photo_profile_tag'),
    )
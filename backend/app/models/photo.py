from datetime import datetime
from sqlalchemy import ForeignKey, Integer, String, DateTime, Boolean, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.cloth import photo_clothes





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
    
    # Новые поля
    rating: Mapped[float] = mapped_column(
        Float,
        nullable=True
    )
    season_id: Mapped[int] = mapped_column(
        ForeignKey("seasons.id", ondelete="SET NULL"),
        nullable=True
    )
    daytime_id: Mapped[int] = mapped_column(
        ForeignKey("daytimes.id", ondelete="SET NULL"),
        nullable=True
    )
    event_id: Mapped[int] = mapped_column(
        ForeignKey("events.id", ondelete="SET NULL"),
        nullable=True
    )


    place_id: Mapped[int] = mapped_column(ForeignKey("places.id", ondelete="SET NULL"), nullable=True)
    place = relationship("Place", back_populates="photos", lazy="selectin")

    tags = relationship(
        "PhotoTag",
        back_populates="photo",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

    # Связи
    profile = relationship("Profile", back_populates="photos", lazy="selectin")
    
    clothes = relationship(
        "Cloth",
        secondary=photo_clothes,
        back_populates="photos",
        lazy="selectin"
    )

    
    season = relationship("Season", back_populates="photos", lazy="selectin")
    daytime = relationship("DayTime", back_populates="photos", lazy="selectin")
    event = relationship("Event", back_populates="photos", lazy="selectin")
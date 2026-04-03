# backend/app/models/platform.py

from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Platform(Base):
    """
    Справочник платформ
    """
    __tablename__ = "platforms"
    __table_args__ = {"extend_existing": True}

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )
    name: Mapped[str] = mapped_column(
        nullable=False,
    )
    base_url: Mapped[str] = mapped_column(
        nullable=False,
        unique=True,
    )

    links = relationship(
        "Link",
        back_populates="platform",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
from sqlalchemy import Boolean, Integer, String, ForeignKey, Table, Column, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


# Таблица связи многие-ко-многим для Profile и Profession
employments = Table(
    "employments",
    Base.metadata,
    Column("profile_id", ForeignKey("profiles.id", ondelete="CASCADE"), primary_key=True),
    Column("profession_id", ForeignKey("professions.id", ondelete="CASCADE"), primary_key=True),
    Column("company_id", ForeignKey("companies.id", ondelete="SET NULL"), nullable=True),
    Column("start_year", Integer, nullable=True),
    Column("end_year", Integer, nullable=True),
    Column("is_current", Boolean, default=False),
    Index("ix_employments_profile_profession", "profile_id", "profession_id")
)


class Profession(Base):
    """
    Справочник профессий
    """
    __tablename__ = "professions"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
        index=True
    )
    name: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True
    )
    
    # Профили, связанные с этой профессией
    profiles = relationship(
        "Profile",
        secondary=employments,
        back_populates="professions",
        lazy="selectin"
    )

    def __eq__(self, other):
        if isinstance(other, Profession):
            return self.name == other.name
        return False
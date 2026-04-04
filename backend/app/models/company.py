from sqlalchemy import String, Table, Column, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


# Таблица связи многие-ко-многим для Company и Address
company_address_association = Table(
    "company_addresses",
    Base.metadata,
    Column("company_id", ForeignKey("companies.id", ondelete="CASCADE"), primary_key=True),
    Column("address_id", ForeignKey("addresses.id", ondelete="CASCADE"), primary_key=True)
)


class Company(Base):
    """
    Справочник компаний
    """
    __tablename__ = "companies"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )
    name: Mapped[str] = mapped_column(
        String(255), 
        nullable=False
    )
    
    # Связь многие-ко-многим с адресами
    addresses = relationship(
        "Address",
        secondary=company_address_association,
        back_populates="companies",
        lazy="selectin"
    )
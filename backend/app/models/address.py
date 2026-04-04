from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.company import company_address_association

class Address(Base):
    """
    Адрес пользователя
    """
    __tablename__ = "addresses"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )
    street: Mapped[str] = mapped_column(
        String(255),
        nullable=True
    )
    house: Mapped[str] = mapped_column(
        String(100),
        nullable=True
    )
    location_id: Mapped[int] = mapped_column(
        ForeignKey("locations.id", ondelete="SET NULL"),
        nullable=True
    )
    
    # Связь с локацией
    location = relationship(
        "Location",
        back_populates="addresses",
        lazy="selectin"
    )

 
    companies = relationship(
        "Company",
        secondary=company_address_association,
        back_populates="addresses",
        lazy="selectin"
    )
    
    # Связь с пользователем (если нужна)
    # user = relationship("User", back_populates="addresses")
from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base



class Place(Base):
    __tablename__ = "places"

    id: Mapped[int] = mapped_column(Integer, autoincrement=True, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    address_id: Mapped[int] = mapped_column(Integer, ForeignKey("addresses.id", ondelete="CASCADE"), nullable=False)

    address = relationship("Address", back_populates="places", lazy="selectin")
    photos = relationship("Photo", back_populates="place", lazy="selectin")
    
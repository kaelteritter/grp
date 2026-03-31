# backend/app/models/country.py


from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Country(Base):
    """
    Справочник стран
    """
    __tablename__ = "countries"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False,)
    

# backend/app/core/config.py

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

from app.core.paths import path_to_root

class Settings(BaseSettings):
    APP_NAME: str = "GraphSocial"
    DEBUG: bool = True

    # Database settings
    DB_SYSTEM: str = "sqlite"
    DB_ENGINE: str = "aiosqlite"
    DB_HOST: Optional[str] = None
    DB_USER: Optional[str] = None
    DB_PASSWORD: Optional[str] = None
    DB_NAME: str = "graphsocial.db"

    # Storage settings
    STORAGE_PATH: str = "./storage"
    S3_STORAGE_BASEPATH: str = "s3"
    S3_STORAGE_MEDIAPATH: str = "media"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )

    @property
    def DATABASE_URL(self) -> str:
        if self.DB_SYSTEM == "sqlite":
            # SQLite connection string
            return f"{self.DB_SYSTEM}+{self.DB_ENGINE}:///{path_to_root}/{self.DB_NAME}"
        else:
            # PostgreSQL or other DB
            return f"{self.DB_SYSTEM}+{self.DB_ENGINE}://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}/{self.DB_NAME}"
    
    @property
    def STORAGE_BASE_PATH(self) -> str:
        """Полный путь к storage"""
        return f"{self.STORAGE_PATH}/{self.S3_STORAGE_BASEPATH}"
    
    @property
    def STORAGE_MEDIA_PATH(self) -> str:
        """Полный путь к media в storage"""
        return f"{self.STORAGE_BASE_PATH}/{self.S3_STORAGE_MEDIAPATH}"


settings = Settings()
# backend/app/core/config.py

import os

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "GraphSocial"
    DEBUG: bool = True
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DATABASE_URL: str = f"sqlite+aiosqlite:///{BASE_DIR}/graphsocial.db"
    
    model_config = SettingsConfigDict(
        env_file=".env"
    )

settings = Settings()
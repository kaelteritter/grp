# backend/app/core/config.py

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "GraphSocial"
    DEBUG: bool = True
    DATABASE_URL: str = "sqlite+aiosqlite:///./graphsocial.db"
    
    model_config = SettingsConfigDict(
        env_file=".env"
    )

settings = Settings()
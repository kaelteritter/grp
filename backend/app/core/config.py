# backend/app/core/config.py

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "GraphSocial"
    DEBUG: bool = True
    
    model_config = SettingsConfigDict(
        env_file=".env"
    )

settings = Settings()
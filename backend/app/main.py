from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from app.core.config import settings
from app.core.paths import STORAGE_DIR
from app.core.database import get_db
from app.api.v1.endpoints import (
    company,
    profession,
    profile,
    country,
    region,
    location,
    platform,
    link,
    photo,
    address,
    video,
)


# ================== СОЗДАНИЕ ПРИЛОЖЕНИЯ ==================
app = FastAPI(
    title=settings.APP_NAME,
    description="GraphSocial API - Social Network Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ================== ЛИМИТЫ ВЗАИМОДЕЙСТВИЯ С API ==================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене заменить на конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================== МОНТИРОВАНИЕ ХРАНИЛИЩА ФАЙЛОВ ==================
print(f"[Main] Storage directory: {STORAGE_DIR}")
print(f"[Main] Storage exists: {STORAGE_DIR.exists()}")

# Создаем storage если нет
STORAGE_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/storage", StaticFiles(directory=str(STORAGE_DIR)), name="storage")
print(f"[Main] Storage mounted at /storage -> {STORAGE_DIR}")

# ================== ПОДКЛЮЧЕНИЕ РОУТЕРОВ API ==================
# Подключаем роутеры напрямую с префиксом /api/v1
app.include_router(profile.router, prefix="/api/v1")
app.include_router(country.router, prefix="/api/v1")
app.include_router(region.router, prefix="/api/v1")
app.include_router(location.router, prefix="/api/v1")
app.include_router(platform.router, prefix="/api/v1")
app.include_router(link.router, prefix="/api/v1")
app.include_router(photo.router, prefix="/api/v1")
app.include_router(address.router, prefix="/api/v1")
app.include_router(company.router, prefix="/api/v1")
app.include_router(profession.router, prefix="/api/v1")
app.include_router(video.router, prefix="/api/v1")

print("[Main] API routers registered with prefix /api/v1")


# ================== HEALTHCHECK ==================
@app.get("/health")
async def health_check():
    return {"status": "ok", "service": settings.APP_NAME, "version": "1.0.0"}


@app.get("/health/db")
async def db_health_check(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": "disconnected", "error": str(e)}


# ================== ЗАПУСК ==================
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG)

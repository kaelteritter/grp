from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, RedirectResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
import os
from pathlib import Path

from app.core.config import settings
from app.core.database import get_db
from app.api.v1.endpoints import profile, country, region, location, platform, link, photo

# Определяем пути
BASE_DIR = Path(__file__).resolve().parent.parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем API роутеры
app.include_router(profile.router, prefix="/api/v1")
app.include_router(country.router, prefix="/api/v1")
app.include_router(region.router, prefix="/api/v1")
app.include_router(location.router, prefix="/api/v1")
app.include_router(platform.router, prefix="/api/v1")
app.include_router(link.router, prefix="/api/v1")
app.include_router(photo.router, prefix="/api/v1")

# Healthcheck эндпоинты
@app.get("/health")
async def health_check():
    return {"status": "ok", "service": settings.APP_NAME}

@app.get("/health/db")
async def db_health_check(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": "disconnected", "error": str(e)}




# SPA роутинг
if FRONTEND_DIR.exists():
    # Монтируем статические файлы
    app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")
    
    # API для получения статики
    @app.get("/css/{file_path:path}")
    async def get_css(file_path: str):
        return FileResponse(os.path.join(FRONTEND_DIR, "css", file_path))
    
    @app.get("/js/{file_path:path}")
    async def get_js(file_path: str):
        return FileResponse(os.path.join(FRONTEND_DIR, "js", file_path))
    
    @app.get("/assets/{file_path:path}")
    async def get_assets(file_path: str):
        return FileResponse(os.path.join(FRONTEND_DIR, "assets", file_path))
    
    # Главная страница - редирект на /profiles
    @app.get("/")
    async def root():
        return RedirectResponse(url="/profiles")
    
    # Страница со списком профилей
    @app.get("/profiles")
    async def profiles_page():
        return FileResponse(os.path.join(FRONTEND_DIR, "profiles.html"))
    
    @app.get("/profiles/all")
    async def profiles_all():
        return FileResponse(os.path.join(FRONTEND_DIR, "profiles.html"))
    
    # Страница конкретного профиля
    @app.get("/profiles/{profile_id}")
    async def profile_detail(profile_id: int):
        return FileResponse(os.path.join(FRONTEND_DIR, "profile.html"))
    
    # Все остальные пути - index.html (для SPA)
    @app.get("/{full_path:path}")
    async def spa_fallback(full_path: str):
        # Если запрос на API - пропускаем
        if full_path.startswith("api/"):
            return {"error": "Not found"}
        
        # Проверяем, существует ли файл
        file_path = FRONTEND_DIR / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))
        
        # Иначе возвращаем index.html
        return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))
else:
    print(f"Warning: Frontend directory not found at {FRONTEND_DIR}")
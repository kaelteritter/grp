from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from app.core.config import settings

from app.api.v1.endpoints import profile, country, region, location, platform, link, photo
from app.core.database import get_db


app = FastAPI(
    title=settings.APP_NAME,
    description="GraphSocial API - Social Network Platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# ================== ЛИМИТЫ ВЗАИМОДЕЙСТВИЯ С API ==================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене заменить на конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================== РОУТИНГ==================
app.include_router(profile.router)
app.include_router(country.router)
app.include_router(region.router)
app.include_router(location.router)
app.include_router(platform.router)
app.include_router(link.router)
app.include_router(photo.router)

app.mount("/api/v1", app)


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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
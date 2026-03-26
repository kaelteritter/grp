# GraphSocial

## Релиз GRAPH-0 ✅

**Что сделано:**
- Настроен FastAPI сервер
- Добавлен healthcheck эндпоинт (`GET /health`)
- Создана базовая HTML страница с проверкой подключения
- Организована структура frontend с разделением JS логики

**Запуск:**
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
# Открыть frontend/index.html в браузере
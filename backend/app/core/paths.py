# backend/app/core/paths.py

from pathlib import Path

# Определяем пути относительно текущего файла
path_to_this_file = Path(__file__).resolve()
path_to_backend = path_to_this_file.parents[2]  # backend/
path_to_root = path_to_backend.parent  # корень проекта
path_to_frontend = path_to_root / "frontend"

# Storage в корне проекта
path_to_storage = path_to_root / "storage"

# Для удобства
BACKEND_DIR = path_to_backend
ROOT_DIR = path_to_root
FRONTEND_DIR = path_to_frontend
STORAGE_DIR = path_to_storage  # <-- теперь storage в корне

print(f"[Paths] ROOT_DIR: {ROOT_DIR}")
print(f"[Paths] STORAGE_DIR: {STORAGE_DIR}")

__all__ = [
    "BACKEND_DIR",
    "ROOT_DIR", 
    "FRONTEND_DIR",
    "STORAGE_DIR"
]
# backend/app/core/storage.py

from dataclasses import dataclass, field
import uuid
from pathlib import Path
from typing import Optional, Dict
from datetime import datetime
import shutil

from app.core.config import settings
from app.core.paths import STORAGE_DIR


@dataclass
class LocalS3Storage:
    """Локальное S3-подобное хранилище"""
    
    base_path: Path = field(default=STORAGE_DIR)
    s3_path: Path = field(init=False)
    
    def __post_init__(self):
        """Инициализация хранилища после создания"""
        print(f"[Storage] Initializing with base_path: {self.base_path}")
        self.s3_path = self.base_path / "s3"
        self._init_directories()
    
    def _init_directories(self):
        """Создает структуру директорий"""
        directories = [
            self.s3_path / "media" / "photos",
            self.s3_path / "media" / "videos",
            self.s3_path / "media" / "icons" / "platforms",
            self.s3_path / "media" / "ui" / "buttons",
        ]
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
            print(f"[Storage] Created directory: {directory}")
    
    @staticmethod
    def get_unique_name(extension: str = "") -> str:
        """Генерирует уникальное имя файла"""
        base_name = f"{uuid.uuid4()}-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        if extension:
            return f"{base_name}{extension}"
        return base_name
    
    def get_bucket_path(self, bucket_name: str, item_id: Optional[int] = None) -> Path:
        """Возвращает путь к бакету"""
        bucket_map = {
            "photos": self.s3_path / "media" / "photos",
            "videos": self.s3_path / "media" / "videos",
            "icons": self.s3_path / "media" / "icons",
            "ui_buttons": self.s3_path / "media" / "ui" / "buttons",
        }
        
        bucket_path = bucket_map.get(bucket_name)
        if not bucket_path:
            raise ValueError(f"Unknown bucket: {bucket_name}")
        
        path = bucket_path
        if item_id:
            path = path / str(item_id)
        return path
    
    def save_file(self, bucket_name: str, file_content: bytes, filename: str, item_id: Optional[int] = None) -> str:
        """Сохраняет файл в указанный бакет"""
        ext = Path(filename).suffix
        unique_name = self.get_unique_name(ext)
        
        dir_path = self.get_bucket_path(bucket_name, item_id)
        dir_path.mkdir(parents=True, exist_ok=True)
        
        file_path = dir_path / unique_name
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        # URL для доступа через сервер
        # Путь относительно корня storage: s3/media/photos/{id}/{filename}
        relative_path = file_path.relative_to(self.base_path)
        url = f"/storage/{relative_path}"
        
        print(f"[Storage] File saved: {file_path}")
        print(f"[Storage] URL: {url}")
        return url
    
    def save_photo(self, profile_id: int, file_content: bytes, filename: str) -> str:
        """Сохраняет фото профиля"""
        return self.save_file("photos", file_content, filename, profile_id)
        
    def save_video(self, profile_id: int, file_content: bytes, filename: str) -> str:
        """Сохраняет видео профиля"""
        return self.save_file("videos", file_content, filename, profile_id)
    
    def save_platform_icon(self, platform_id: int, file_content: bytes, filename: str, version: int = 1) -> str:
        """Сохраняет иконку платформы"""
        # Создаем поддиректорию для версий
        ext = Path(filename).suffix
        unique_name = f"v{version}{ext}"
        
        dir_path = self.get_bucket_path("icons", platform_id)
        dir_path.mkdir(parents=True, exist_ok=True)
        
        file_path = dir_path / unique_name
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        relative_path = file_path.relative_to(self.base_path)
        return f"/storage/{relative_path}"
    
    def save_ui_button_icon(self, action: str, file_content: bytes, filename: str, version: int = 1) -> str:
        """Сохраняет иконку UI кнопки"""
        ext = Path(filename).suffix
        unique_name = f"v{version}{ext}"
        
        dir_path = self.get_bucket_path("ui_buttons") / action
        dir_path.mkdir(parents=True, exist_ok=True)
        
        file_path = dir_path / unique_name
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        relative_path = file_path.relative_to(self.base_path)
        return f"/storage/{relative_path}"
    
    def delete_file(self, file_url: str) -> bool:
        """Удаляет файл по URL"""
        if file_url.startswith("/storage/"):
            relative_path = file_url.replace("/storage/", "")
            file_path = self.base_path / relative_path
            if file_path.exists():
                file_path.unlink()
                return True
        return False
    
    def delete_bucket_items(self, bucket_name: str, item_id: int) -> bool:
        """Удаляет все файлы в бакете для указанного ID"""
        dir_path = self.get_bucket_path(bucket_name, item_id)
        if dir_path.exists():
            shutil.rmtree(dir_path)
            return True
        return False
    
    def delete_profile_photos(self, profile_id: int) -> bool:
        """Удаляет все фото профиля"""
        return self.delete_bucket_items("photos", profile_id)
    
    def delete_profile_videos(self, profile_id: int) -> bool:
        """Удаляет все видео профиля"""
        return self.delete_bucket_items("videos", profile_id)
    
    def delete_platform_icons(self, platform_id: int) -> bool:
        """Удаляет все иконки платформы"""
        return self.delete_bucket_items("icons", platform_id)
    
    def get_file_path(self, file_url: str) -> Optional[Path]:
        """Возвращает путь к файлу по URL"""
        if file_url.startswith("/storage/"):
            relative_path = file_url.replace("/storage/", "")
            file_path = self.base_path / relative_path
            if file_path.exists():
                return file_path
        return None
    
    def file_exists(self, file_url: str) -> bool:
        """Проверяет существование файла"""
        return self.get_file_path(file_url) is not None


# Создаем глобальный экземпляр хранилища
storage = LocalS3Storage()
print(f"[Storage] Instance created with base_path: {storage.base_path}")
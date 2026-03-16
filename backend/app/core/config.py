from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "MuseWave API"
    app_env: str = "development"
    app_version: str = "1.0.0"
    public_base_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:3000"
    database_url: str = "sqlite:///./musewave.db"
    exports_enabled: bool = False
    export_storage: Literal["local", "r2"] = "local"
    local_storage_dir: str = "./storage"
    export_poll_seconds: int = 5
    auto_create_tables: bool = True
    r2_bucket: str | None = None
    r2_region: str = "auto"
    r2_endpoint: str | None = None
    r2_access_key_id: str | None = None
    r2_secret_access_key: str | None = None
    r2_public_base_url: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def backend_root(self) -> Path:
        return Path(__file__).resolve().parents[2]

    @property
    def media_root(self) -> Path:
        target = Path(self.local_storage_dir)
        if target.is_absolute():
            return target
        return (self.backend_root / target).resolve()


@lru_cache
def get_settings() -> Settings:
    return Settings()

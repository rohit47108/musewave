from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO
from pathlib import Path

import boto3

from app.core.config import Settings, get_settings


@dataclass
class StoredObject:
    key: str
    url: str


class LocalStorageService:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.root = settings.media_root
        self.root.mkdir(parents=True, exist_ok=True)

    def save_bytes(self, folder: str, filename: str, content: bytes, content_type: str) -> StoredObject:
        target_dir = self.root / folder
        target_dir.mkdir(parents=True, exist_ok=True)
        target = target_dir / filename
        target.write_bytes(content)
        key = f"{folder}/{filename}"
        return StoredObject(key=key, url=f"{self.settings.public_base_url}/media/{key}")


class R2StorageService:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.client = boto3.client(
            "s3",
            endpoint_url=settings.r2_endpoint,
            aws_access_key_id=settings.r2_access_key_id,
            aws_secret_access_key=settings.r2_secret_access_key,
            region_name=settings.r2_region
        )

    def save_bytes(self, folder: str, filename: str, content: bytes, content_type: str) -> StoredObject:
        key = f"{folder}/{filename}"
        self.client.upload_fileobj(
            BytesIO(content),
            self.settings.r2_bucket,
            key,
            ExtraArgs={"ContentType": content_type}
        )
        if self.settings.r2_public_base_url:
            url = f"{self.settings.r2_public_base_url.rstrip('/')}/{key}"
        else:
            url = f"{self.settings.public_base_url}/media/{key}"
        return StoredObject(key=key, url=url)


def get_storage_service(settings: Settings | None = None):
    current = settings or get_settings()
    if current.export_storage == "r2" and current.r2_bucket and current.r2_endpoint:
        return R2StorageService(current)
    return LocalStorageService(current)

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class ExportJobRecord(Base):
    __tablename__ = "export_jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scene_slug: Mapped[str] = mapped_column(String(120), ForeignKey("scenes.slug"), index=True)
    status: Mapped[str] = mapped_column(String(24), index=True, default="queued")
    duration_seconds: Mapped[int] = mapped_column(Integer)
    audio_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    scene_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    storage_key: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    error_message: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

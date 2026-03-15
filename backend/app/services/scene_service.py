from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.export_job import ExportJobRecord
from app.models.scene import SceneRecord
from app.schemas.scene import ExportJob, ExportRequest, SceneSpec, ShareSceneRequest, ShareSceneResponse
from app.services.mood_composer import canonicalize_scene
from app.services.slugger import build_pretty_slug, slugify


def scene_to_response(record: SceneRecord) -> ShareSceneResponse:
    settings = get_settings()
    scene = SceneSpec.model_validate(record.scene_json)
    return ShareSceneResponse(
        slug=record.slug,
        share_url=f"{settings.frontend_url.rstrip('/')}/soundscape/{record.slug}",
        embed_url=f"{settings.frontend_url.rstrip('/')}/embed/{record.slug}",
        og_image_url=f"{settings.frontend_url.rstrip('/')}/soundscape/{record.slug}/opengraph-image",
        scene=scene,
        created_at=record.created_at,
        updated_at=record.updated_at
    )


def export_to_schema(record: ExportJobRecord) -> ExportJob:
    return ExportJob(
        id=record.id,
        slug=record.scene_slug,
        duration_seconds=record.duration_seconds,
        status=record.status,
        audio_url=record.audio_url,
        scene_url=record.scene_url,
        error_message=record.error_message,
        created_at=record.created_at,
        updated_at=record.updated_at
    )


def ensure_unique_slug(database: Session, title: str, seed: int) -> str:
    base_seed = seed
    while True:
      candidate = build_pretty_slug(title, base_seed)
      exists = database.scalar(select(SceneRecord).where(SceneRecord.slug == candidate))
      if exists is None:
          return candidate
      base_seed += 1


def upsert_scene(database: Session, payload: ShareSceneRequest) -> ShareSceneResponse:
    canonical = canonicalize_scene(payload.scene)

    record = None
    desired_slug = payload.slug or canonical.slug
    if desired_slug:
        record = database.scalar(select(SceneRecord).where(SceneRecord.slug == slugify(desired_slug)))

    if record is None:
        record = SceneRecord(
            slug=ensure_unique_slug(database, canonical.title, canonical.seed),
            title=canonical.title,
            description=canonical.description,
            scene_json=canonical.model_dump(by_alias=True),
            visual_profile=canonical.visual_profile.model_dump(by_alias=True)
        )
        database.add(record)
    else:
        record.title = canonical.title
        record.description = canonical.description
        record.scene_json = canonical.model_dump(by_alias=True)
        record.visual_profile = canonical.visual_profile.model_dump(by_alias=True)

    database.commit()
    database.refresh(record)

    canonical = canonical.model_copy(
        update={
            "slug": record.slug,
            "created_at": record.created_at.isoformat(),
            "updated_at": record.updated_at.isoformat()
        }
    )
    record.scene_json = canonical.model_dump(by_alias=True)
    database.commit()
    database.refresh(record)
    return scene_to_response(record)


def get_scene_by_slug(database: Session, slug: str) -> ShareSceneResponse | None:
    record = database.scalar(select(SceneRecord).where(SceneRecord.slug == slug))
    if record is None:
        return None
    return scene_to_response(record)


def enqueue_export(database: Session, slug: str, payload: ExportRequest) -> ExportJob:
    scene = database.scalar(select(SceneRecord).where(SceneRecord.slug == slug))
    if scene is None:
        raise ValueError("Scene not found.")

    if payload.scene is not None:
        scene.scene_json = canonicalize_scene(payload.scene).model_dump(by_alias=True)
        scene.visual_profile = scene.scene_json["visualProfile"]
        database.commit()
        database.refresh(scene)

    job = ExportJobRecord(
        scene_slug=slug,
        duration_seconds=payload.duration_seconds,
        status="queued"
    )
    database.add(job)
    database.commit()
    database.refresh(job)
    return export_to_schema(job)


def get_export_job(database: Session, job_id: str) -> ExportJob | None:
    record = database.scalar(select(ExportJobRecord).where(ExportJobRecord.id == job_id))
    if record is None:
        return None
    return export_to_schema(record)


def claim_next_export_job(database: Session) -> ExportJobRecord | None:
    job = database.scalar(
        select(ExportJobRecord)
        .where(ExportJobRecord.status == "queued")
        .order_by(ExportJobRecord.created_at.asc())
    )
    if job is None:
        return None

    job.status = "processing"
    job.updated_at = datetime.now(timezone.utc)
    database.commit()
    database.refresh(job)
    return job


def get_scene_record(database: Session, slug: str) -> SceneRecord | None:
    return database.scalar(select(SceneRecord).where(SceneRecord.slug == slug))

from __future__ import annotations

import logging
import time
from datetime import datetime, timezone

from app.core.config import get_settings
from app.db.session import SessionLocal
from app.schemas.scene import SceneSpec
from app.services.audio_renderer import render_scene_to_wav, scene_to_json_bytes
from app.services.scene_service import claim_next_export_job, get_scene_record
from app.services.storage import get_storage_service

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("musewave-worker")


def process_job() -> bool:
    settings = get_settings()
    storage = get_storage_service(settings)

    with SessionLocal() as database:
        job = claim_next_export_job(database)
        if job is None:
            return False

        scene_record = get_scene_record(database, job.scene_slug)
        if scene_record is None:
            job.status = "failed"
            job.error_message = "Scene missing."
            job.updated_at = datetime.now(timezone.utc)
            database.commit()
            return True

        try:
            scene = SceneSpec.model_validate(scene_record.scene_json)
            wav_bytes = render_scene_to_wav(scene, job.duration_seconds)
            json_bytes = scene_to_json_bytes(scene)

            audio = storage.save_bytes(
                "exports",
                f"{job.scene_slug}-{job.id}.wav",
                wav_bytes,
                "audio/wav"
            )
            scene_json = storage.save_bytes(
                "scenes",
                f"{job.scene_slug}-{job.id}.json",
                json_bytes,
                "application/json"
            )

            job.audio_url = audio.url
            job.scene_url = scene_json.url
            job.storage_key = audio.key
            job.status = "completed"
            job.error_message = None
        except Exception as error:  # pragma: no cover - runtime path
            logger.exception("Export failed for job %s", job.id)
            job.status = "failed"
            job.error_message = str(error)
        finally:
            job.updated_at = datetime.now(timezone.utc)
            database.commit()

        logger.info("Processed job %s with status %s", job.id, job.status)
        return True


def run_worker() -> None:
    settings = get_settings()
    logger.info("MuseWave export worker started.")

    while True:
        processed = process_job()
        if not processed:
            time.sleep(settings.export_poll_seconds)


if __name__ == "__main__":
    run_worker()
